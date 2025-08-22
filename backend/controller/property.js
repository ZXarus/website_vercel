const express = require('express');
const { supabaseAdmin } = require('../supabase');

const TABLE_PROPERTY_DATA = 'property_data';
const TABLE_PROPERTY_IMAGES = 'property_images';


//CREATE
exports.createProperty = async (req, res) => {

}


//READ
exports.listProperties = async (req, res) => {
  try {
    // --- pagination (fixed 12 per page) ---
    const page = Math.max(1, parseInt(req.query.page ?? '1', 10));
    const pageSize = 12; // <- fixed as requested
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // --- optional filters ---
    const {
      search,
      type,
      priceBucket,
      changeDir,      // increase | decrease | any
      changeBand,     // gt15 | plus5to15 | minus5to5 | minus15toMinus5 | ltMinus15
      sortBy,         // highest_change | lowest_change | highest_price | lowest_price | most_bedrooms | most_bathrooms | largest_size | newest
      hasImage,
    } = req.query;

    let q = supabaseAdmin.from(TABLE_PROPERTY_DATA).select('*', { count: 'exact' });

    // text filters
    if (type) q = q.ilike('PROPERTY_TYPE', `%${String(type).trim()}%`);
    if (search) {
      const s = `%${String(search).trim()}%`;
      q = q.or(`"ADDRESS".ilike.${s},"BOROUGH".ilike.${s},"PROPERTY_TYPE".ilike.${s}`);
    }

    // price buckets → Actual_Price
    switch (priceBucket) {
      case 'under_500k':
        q = q.lte('Actual_Price', 500000);
        break;
      case '500k_1m':
        q = q.gte('Actual_Price', 500000).lte('Actual_Price', 1000000);
        break;
      case '1m_2m':
        q = q.gte('Actual_Price', 1000000).lte('Actual_Price', 2000000);
        break;
      case 'over_2m':
        q = q.gte('Actual_Price', 2000000);
        break;
      default:
        // Any Price -> no constraint
        break;
    }

    // change direction
    if (changeDir === 'increase') q = q.gt('Percentage_Change', 0);
    if (changeDir === 'decrease') q = q.lt('Percentage_Change', 0);

    // change bands (overrides just direction if both present)
    switch (changeBand) {
      case 'gt15':             // +15% or more
        q = q.gte('Percentage_Change', 15);
        break;
      case 'plus5to15':        // +5% to +15%
        q = q.gte('Percentage_Change', 5).lte('Percentage_Change', 15);
        break;
      case 'minus5to5':        // -5% to +5%
        q = q.gte('Percentage_Change', -5).lte('Percentage_Change', 5);
        break;
      case 'minus15toMinus5':  // -15% to -5%
        q = q.gte('Percentage_Change', -15).lte('Percentage_Change', -5);
        break;
      case 'ltMinus15':        // -15% or less
        q = q.lte('Percentage_Change', -15);
        break;
      default:
        // Any Change -> no band constraint
        break;
    }

    // sorting
    switch (sortBy) {
      case 'highest_change':
        q = q.order('Percentage_Change', { ascending: false, nullsFirst: false });
        break;
      case 'lowest_change':
        q = q.order('Percentage_Change', { ascending: true, nullsFirst: true });
        break;
      case 'highest_price':
        q = q.order('Actual_Price', { ascending: false });
        break;
      case 'lowest_price':
        q = q.order('Actual_Price', { ascending: true });
        break;
      case 'most_bedrooms':
        q = q.order('BEDS', { ascending: false }).order('Actual_Price', { ascending: false });
        break;
      case 'most_bathrooms':
        q = q.order('BATH', { ascending: false }).order('Actual_Price', { ascending: false });
        break;
      case 'largest_size':
        q = q.order('PROPERTYSQFT', { ascending: false });
        break;
      case 'newest':
        // if you have created_at, use that; else id as a proxy
        q = q.order('id', { ascending: false });
        break;
      default:
        q = q.order('id', { ascending: true }); // default order
    }

    // pagination window (0‑based inclusive)
    q = q.range(from, to);

    const { data: props, error, count } = await q;
    if (error) {
      console.error('property query error:', error);
      return res.status(500).json({ error: 'Failed to fetch properties' });
    }

    // --- fetch images (unlinked → deterministic pick) ---
    // ---- fetch ALL images for the properties on this page (1 query) ----
    const propIds = (props ?? []).map(p => p.id);

    let imagesByProp = new Map();

    if (propIds.length) {
      const { data: imgRows, error: imgErr } = await supabaseAdmin
        .from('property_images')
        .select('id, property_id, image_url, category, subcategory, sort_order, is_primary')
        .in('property_id', propIds)
        // order so hero shows first, then exterior, then interior groups & sort_order
        .order('is_primary', { ascending: false })
        .order('category', { ascending: true })             // exterior before interior
        .order('subcategory', { ascending: true, nullsFirst: true })
        .order('sort_order', { ascending: true })
        .order('id', { ascending: true });

      if (imgErr) {
        console.error('image query error:', imgErr);
        return res.status(500).json({ error: 'Failed to fetch images' });
      }

      for (const r of (imgRows ?? [])) {
        if (!imagesByProp.has(r.property_id)) imagesByProp.set(r.property_id, []);
        imagesByProp.get(r.property_id).push({
          id: r.id,
          url: r.image_url,
          category: r.category,        // 'exterior' | 'interior'
          subcategory: r.subcategory,  // e.g. 'bedroom','bathroom' or null
          sortOrder: r.sort_order,
          isPrimary: r.is_primary
        });
      }
    }

    // ---- attach hero + full image list to each property ----
    const data = (props ?? []).map(p => {
      const imgs = [...(imagesByProp.get(p.id) ?? [])]; // copy so we can sort in place

      // rank function for desired order: exterior → bedrooms → bathrooms → others
      const rank = (i) =>
        i.category === 'exterior' ? 0 :
          i.subcategory === 'bedroom' ? 1 :
            i.subcategory === 'bathroom' ? 2 : 3;

      // sort images deterministically
      imgs.sort((a, b) =>
        rank(a) - rank(b) ||
        a.sortOrder - b.sortOrder ||
        a.id - b.id
      );

      // pick hero (primary → first exterior → first image)
      const hero =
        imgs.find(i => i.isPrimary)?.url ??
        imgs.find(i => i.category === 'exterior')?.url ??
        imgs[0]?.url ??
        null;

      // if you DON'T want the hero duplicated in images[], filter it out
      const images = hero ? imgs.filter(i => i.url !== hero) : imgs;

      return {
        ...p,
        heroImage: hero,
        images
      };
    });
    const total = count ?? 0;
    const totalPages = Math.ceil(total / pageSize);

    return res.status(200).json({
      data,
      pageMeta: {
        page,
        pageSize,
        total,
        totalPages,
        hasPrev: page > 1,
        hasNext: page < totalPages
      }
    });

  } catch (e) {
    console.error('listProperties error:', e);
    return res.status(500).json({ error: 'Internal server error' });
  }
};