-- Seed Products
INSERT INTO products (slug, name, name_en, description, description_en, category, price, sku, variant_color, featured, metadata)
VALUES
    ('herbal-mint', '凉茶薄荷糖', 'Herbal Mint Candy',
     '传统凉茶配方，清凉解暑，薄荷提神。无糖配方，随时随地享受清凉。',
     'Traditional herbal tea formula meets cooling mint. Sugar-free, refreshing, and naturally soothing. Perfect for anytime, anywhere.',
     'candy', 12.90, 'AM-HM-001', 'cream', true,
     '{"sugar_free": true, "ingredients": ["Mint extract", "Herbal tea concentrate", "Stevia", "Natural flavoring"], "weight": "50g", "benefits": ["Cooling relief", "Fresh breath", "Sugar free", "Natural herbs"]}'::jsonb),

    ('chrysanthemum-ginseng-mint', '菊花洋参薄荷糖', 'Chrysanthemum Ginseng Mint',
     '菊花洋参配方，润喉养生，清凉舒爽。传统草本智慧，现代无糖工艺。',
     'Chrysanthemum and American ginseng formula with cooling mint. A nourishing blend rooted in traditional herbal wisdom, crafted with modern sugar-free technology.',
     'candy', 14.90, 'AM-CG-001', 'navy', true,
     '{"sugar_free": true, "ingredients": ["Chrysanthemum extract", "American ginseng", "Mint extract", "Stevia", "Natural flavoring"], "weight": "50g", "benefits": ["Throat soothing", "Nourishing", "Sugar free", "Traditional formula"]}'::jsonb);

-- Seed Variants
INSERT INTO product_variants (product_id, name, price, sku, sort_order)
SELECT id, 'Single Tin (50g)', 12.90, 'AM-HM-001-S', 0 FROM products WHERE slug = 'herbal-mint'
UNION ALL
SELECT id, 'Twin Pack', 23.90, 'AM-HM-001-T', 1 FROM products WHERE slug = 'herbal-mint'
UNION ALL
SELECT id, 'Gift Box (6 Tins)', 69.90, 'AM-HM-001-G', 2 FROM products WHERE slug = 'herbal-mint';

INSERT INTO product_variants (product_id, name, price, sku, sort_order)
SELECT id, 'Single Tin (50g)', 14.90, 'AM-CG-001-S', 0 FROM products WHERE slug = 'chrysanthemum-ginseng-mint'
UNION ALL
SELECT id, 'Twin Pack', 27.90, 'AM-CG-001-T', 1 FROM products WHERE slug = 'chrysanthemum-ginseng-mint'
UNION ALL
SELECT id, 'Gift Box (6 Tins)', 79.90, 'AM-CG-001-G', 2 FROM products WHERE slug = 'chrysanthemum-ginseng-mint';
