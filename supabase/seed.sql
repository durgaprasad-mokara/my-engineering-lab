-- Seed: component taxonomy only (master spec §4).
-- No technical values are seeded here; component records with sourced,
-- datasheet-backed specifications arrive in Phase 2.

insert into public.component_categories (slug, name, sort_order) values
  ('passive', 'Passive components', 10),
  ('semiconductor', 'Semiconductor components', 20),
  ('integrated-circuits', 'Integrated circuits', 30),
  ('power-electronics', 'Power electronics', 40),
  ('connectors-interfaces', 'Connectors and interfaces', 50)
on conflict (slug) do nothing;

with parents as (select id, slug from public.component_categories where parent_id is null)
insert into public.component_categories (slug, name, parent_id, sort_order)
select c.slug, c.name, p.id, c.sort_order
from (values
  ('resistors','Resistors','passive',1), ('capacitors','Capacitors','passive',2),
  ('inductors','Inductors','passive',3), ('transformers','Transformers','passive',4),
  ('crystals','Crystals','passive',5), ('oscillators','Oscillators','passive',6),
  ('diodes','Diodes','semiconductor',1), ('leds','LEDs','semiconductor',2),
  ('zener-diodes','Zener diodes','semiconductor',3), ('bjts','Transistors (BJT)','semiconductor',4),
  ('mosfets','MOSFETs','semiconductor',5), ('igbts','IGBTs','semiconductor',6),
  ('thyristors','Thyristors','semiconductor',7),
  ('op-amps','Operational amplifiers','integrated-circuits',1), ('timers','Timers','integrated-circuits',2),
  ('logic-ics','Logic ICs','integrated-circuits',3), ('adcs','ADCs','integrated-circuits',4),
  ('dacs','DACs','integrated-circuits',5), ('memory-ics','Memory ICs','integrated-circuits',6),
  ('pmics','Power management ICs','integrated-circuits',7), ('motor-drivers','Motor driver ICs','integrated-circuits',8),
  ('communication-ics','Communication ICs','integrated-circuits',9),
  ('dc-dc','DC-DC converters','power-electronics',1), ('buck','Buck converters','power-electronics',2),
  ('boost','Boost converters','power-electronics',3), ('ldo','LDO regulators','power-electronics',4),
  ('bms','Battery management systems','power-electronics',5), ('chargers','Charging controllers','power-electronics',6),
  ('protection','Protection circuits','power-electronics',7),
  ('usb','USB','connectors-interfaces',1), ('usb-c','USB-C','connectors-interfaces',2),
  ('jst','JST','connectors-interfaces',3), ('terminal-blocks','Terminal blocks','connectors-interfaces',4),
  ('ffc-fpc','FFC/FPC connectors','connectors-interfaces',5), ('sma','SMA','connectors-interfaces',6),
  ('rp-sma','RP-SMA','connectors-interfaces',7), ('u-fl','U.FL / IPEX','connectors-interfaces',8)
) as c(slug, name, parent_slug, sort_order)
join parents p on p.slug = c.parent_slug
on conflict (slug) do nothing;
