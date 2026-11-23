// core/upgrades.mjs -- upgrade definitions for all 14 skills

export const SKILL_UPGRADES = {
  woodcutting: [
    { id:'interval',  name:'Swift Axe',         icon:'&#127795;', description:'Reduces Woodcutting interval by 1% per rank. Can exceed 250ms floor.', valuePerRank:0.01, toggleable:false },
    { id:'bonusItem', name:'Bountiful Harvest',  icon:'&#127795;', description:'5% chance per rank to receive a bonus log per cut.', valuePerRank:0.05, toggleable:false },
    { id:'birdNest',  name:'Nest Hunter',        icon:'&#129411;', description:'2% chance per rank to find a Bird Nest while cutting.', valuePerRank:0.02, toggleable:false , maxRank:50 },
    { id:'autoBurn',  name:'Pyromancer',         icon:'&#128293;', description:'10% chance per rank to auto-burn logs, granting Firemaking XP.', valuePerRank:0.10, toggleable:true , maxRank:10 },
    { id:'skillXP',   name:'Student of the Forest', icon:'&#128218;', description:'+10% Woodcutting XP per rank.', valuePerRank:0.10, toggleable:false },
    { id:'masteryXP', name:'Master Arborist',    icon:'&#127795;', description:'+10% Woodcutting Mastery XP per rank.', valuePerRank:0.10, toggleable:false },
    { id:'masteryShare', name:'Shared Mastery', icon:'&#127760;', description:'Each rank adds 0.5% chance to trigger. On trigger, shares (1% + 0.5% per rank) of mastery XP to all other unlocked actions.', valuePerRank:0.005, toggleable:true },
    { id:'masteryAnchor', name:'Mastery Anchor', icon:'&#9889;', description:'Prestiging no longer fully resets mastery -- mastery levels at or below your rank are kept as-is; higher levels are capped down to your rank.', valuePerRank:1, toggleable:false, maxRank:99 },
    { id:'worker',    name:'Hire Lumberjack',    icon:'&#129485;', description:'Passive lumberjack chops selected tree every 5s. 25% XP. 33% more per hire.', worker:true, baseCost:5 },
  ],
  fishing: [
    { id:'interval',   name:'Expert Angler',    icon:'&#127907;', description:'Reduces fishing interval by 1% per rank.', valuePerRank:0.01, toggleable:false },
    { id:'bonusItem',  name:'Full Net',          icon:'&#129726;', description:'5% chance per rank for a bonus fish.', valuePerRank:0.05, toggleable:false },
    { id:'specialFind',name:'Treasure Hunter',  icon:'&#127381;', description:'2% chance per rank for a special item. Reduces junk by 2% per rank.', valuePerRank:0.02, toggleable:false },
    { id:'cookFish',   name:'Seaside Chef',      icon:'&#127859;', description:'5% chance per rank to instantly cook caught fish, granting Cooking XP.', valuePerRank:0.05, toggleable:true },
    { id:'skillXP',    name:'Student of the Sea',icon:'&#128218;', description:'+10% Fishing XP per rank.', valuePerRank:0.10, toggleable:false },
    { id:'masteryXP',  name:'Master Fisher',     icon:'&#127868;', description:'+10% Fishing Mastery XP per rank.', valuePerRank:0.10, toggleable:false },
    { id:'masteryShare', name:'Shared Mastery', icon:'&#127760;', description:'Each rank adds 0.5% chance to trigger. On trigger, shares (1% + 0.5% per rank) of mastery XP to all other unlocked actions.', valuePerRank:0.005, toggleable:true },
    { id:'masteryAnchor', name:'Mastery Anchor', icon:'&#9889;', description:'Prestiging no longer fully resets mastery -- mastery levels at or below your rank are kept as-is; higher levels are capped down to your rank.', valuePerRank:1, toggleable:false, maxRank:99 },
    { id:'worker',     name:'Hire Fisherman',    icon:'&#127907;', description:'Passive fisherman catches fish every 6s. 25% XP. 33% more per hire.', worker:true, baseCost:5 },
  ],
  firemaking: [
    { id:'interval',  name:'Swift Flame',        icon:'&#128293;', description:'Reduces Firemaking interval by 1% per rank.', valuePerRank:0.01, toggleable:false },
    { id:'bonusItem', name:'Inferno',             icon:'&#129747;', description:'5% chance per rank to burn a bonus log with full XP.', valuePerRank:0.05, toggleable:false },
    { id:'bonfireXP', name:'Grand Bonfire',      icon:'&#127806;', description:'+5% bonfire XP bonus and duration per rank.', valuePerRank:0.05, toggleable:false },
    { id:'byproduct', name:'Ash Collector',       icon:'&#129702;', description:'+5% chance per rank for extra Coal Ore, Ash, Charcoal.', valuePerRank:0.05, toggleable:false },
    { id:'skillXP',   name:'Student of Fire',    icon:'&#128218;', description:'+10% Firemaking XP per rank.', valuePerRank:0.10, toggleable:false },
    { id:'masteryXP', name:'Master Pyromancer',  icon:'&#127774;', description:'+10% Firemaking Mastery XP per rank.', valuePerRank:0.10, toggleable:false },
    { id:'masteryShare', name:'Shared Mastery', icon:'&#127760;', description:'Each rank adds 0.5% chance to trigger. On trigger, shares (1% + 0.5% per rank) of mastery XP to all other unlocked actions.', valuePerRank:0.005, toggleable:true },
    { id:'masteryAnchor', name:'Mastery Anchor', icon:'&#9889;', description:'Prestiging no longer fully resets mastery -- mastery levels at or below your rank are kept as-is; higher levels are capped down to your rank.', valuePerRank:1, toggleable:false, maxRank:99 },
    { id:'worker',    name:'Hire Firemaker',      icon:'&#129294;', description:'Passive firemaker burns logs every 7s. 25% XP. 33% more per hire.', worker:true, baseCost:5 },
  ],
  cooking: [
    { id:'interval',   name:'Swift Kitchen',     icon:'&#9201;',   description:'Reduces Cooking interval by 1% per rank.', valuePerRank:0.01, toggleable:false },
    { id:'healingBonus',name:'Nourishing Touch', icon:'&#10084;',  description:'+1 healing value per rank on all cooked food.', valuePerRank:1, toggleable:false },
    { id:'batchCook',  name:'Batch Cooking',     icon:'&#127858;', description:'0.2% chance per rank to cook up to 1+rank extra items at once.', valuePerRank:0.002, toggleable:false },
    { id:'bonusItem',  name:'Double Portion',    icon:'&#127859;', description:'5% chance per rank for a bonus cooked item.', valuePerRank:0.05, toggleable:false },
    { id:'skillXP',    name:'Student of the Kitchen',icon:'&#128218;',description:'+10% Cooking XP per rank.', valuePerRank:0.10, toggleable:false },
    { id:'masteryXP',  name:'Master Cook',       icon:'&#127859;', description:'+10% Cooking Mastery XP per rank.', valuePerRank:0.10, toggleable:false },
    { id:'masteryShare', name:'Shared Mastery', icon:'&#127760;', description:'Each rank adds 0.5% chance to trigger. On trigger, shares (1% + 0.5% per rank) of mastery XP to all other unlocked actions.', valuePerRank:0.005, toggleable:true },
    { id:'masteryAnchor', name:'Mastery Anchor', icon:'&#9889;', description:'Prestiging no longer fully resets mastery -- mastery levels at or below your rank are kept as-is; higher levels are capped down to your rank.', valuePerRank:1, toggleable:false, maxRank:99 },
    { id:'worker',     name:'Hire Chef',         icon:'&#128116;', description:'Passive chef cooks recipes every 6s. 25% XP. 33% more per hire.', worker:true, baseCost:5 },
  ],
  mining: [
    { id:'interval',   name:'Power Drill',       icon:'&#9935;',   description:'Reduces Mining interval by 1% per rank.', valuePerRank:0.01, toggleable:false },
    { id:'bonusItem',  name:'Rich Vein',          icon:'&#129713;', description:'5% chance per rank for a bonus ore.', valuePerRank:0.05, toggleable:false },
    { id:'gemChance',  name:'Gem Seeker',         icon:'&#128142;', description:'+2% gem drop chance per rank.', valuePerRank:0.02, toggleable:false , maxRank:50 },
    { id:'rockHP',     name:'Reinforced Pickaxe', icon:'&#9935;',   description:'+10% rock HP per rank.', valuePerRank:0.10, toggleable:false },
    { id:'preserveHP', name:'Careful Strike',    icon:'&#129776;', description:'2% chance per rank to not consume rock HP.', valuePerRank:0.02, toggleable:false },
    { id:'fastRespawn',name:'Rapid Veins',        icon:'&#9201;',   description:'-5% rock respawn interval per rank.', valuePerRank:0.05, toggleable:false },
    { id:'smeltOre',   name:'Field Smelter',      icon:'&#128293;', description:'5% chance per rank to smelt ore into bar, granting Smithing XP.', valuePerRank:0.05, toggleable:true },
    { id:'skillXP',    name:'Student of the Deep',icon:'&#128218;',description:'+10% Mining XP per rank.', valuePerRank:0.10, toggleable:false },
    { id:'masteryXP',  name:'Master Miner',       icon:'&#129717;', description:'+10% Mining Mastery XP per rank.', valuePerRank:0.10, toggleable:false },
    { id:'masteryShare', name:'Shared Mastery', icon:'&#127760;', description:'Each rank adds 0.5% chance to trigger. On trigger, shares (1% + 0.5% per rank) of mastery XP to all other unlocked actions.', valuePerRank:0.005, toggleable:true },
    { id:'masteryAnchor', name:'Mastery Anchor', icon:'&#9889;', description:'Prestiging no longer fully resets mastery -- mastery levels at or below your rank are kept as-is; higher levels are capped down to your rank.', valuePerRank:1, toggleable:false, maxRank:99 },
    { id:'worker',     name:'Hire Miner',         icon:'&#9935;',   description:'Passive miner mines rocks every 5s. 25% XP. 33% more per hire.', worker:true, baseCost:5 },
  ],
  smithing: [
    { id:'interval',    name:'Master Forge',     icon:'&#128293;', description:'Reduces Smithing interval by 1% per rank.', valuePerRank:0.01, toggleable:false },
    { id:'bonusItem',   name:'Rich Alloy',        icon:'&#129712;', description:'5% chance per rank for bonus output.', valuePerRank:0.05, toggleable:false },
    { id:'preserveMats',name:'Efficient Smelter', icon:'&#9965;',   description:'0.5% chance per rank to preserve materials.', valuePerRank:0.005, toggleable:true , maxRank:200 },
    { id:'skillXP',     name:'Student of the Forge',icon:'&#128218;',description:'+10% Smithing XP per rank.', valuePerRank:0.10, toggleable:false },
    { id:'masteryXP',   name:'Master Smith',      icon:'&#129717;', description:'+10% Smithing Mastery XP per rank.', valuePerRank:0.10, toggleable:false },
    { id:'masteryShare', name:'Shared Mastery', icon:'&#127760;', description:'Each rank adds 0.5% chance to trigger. On trigger, shares (1% + 0.5% per rank) of mastery XP to all other unlocked actions.', valuePerRank:0.005, toggleable:true },
    { id:'masteryAnchor', name:'Mastery Anchor', icon:'&#9889;', description:'Prestiging no longer fully resets mastery -- mastery levels at or below your rank are kept as-is; higher levels are capped down to your rank.', valuePerRank:1, toggleable:false, maxRank:99 },
    { id:'worker',      name:'Hire Smith',        icon:'&#128296;', description:'Passive smith crafts selected recipe every 5s. 25% XP.', worker:true, baseCost:5 },
  ],
  thieving: [
    { id:'interval',   name:'Swift Hands',       icon:'&#128070;', description:'Reduces Thieving interval by 1% per rank.', valuePerRank:0.01, toggleable:false },
    { id:'bonusLoot',  name:'Extra Pockets',     icon:'&#127890;', description:'5% chance per rank for bonus loot.', valuePerRank:0.05, toggleable:false },
    { id:'bonusGP',    name:'Light Fingers',     icon:'&#128176;', description:'5% chance per rank for bonus GP roll.', valuePerRank:0.05, toggleable:false },
    { id:'perception', name:'Keen Eye',          icon:'&#128065;', description:'+2 perception per rank, improving success rate.', valuePerRank:2, toggleable:false },
    { id:'skillXP',    name:'Student of the Streets',icon:'&#128218;',description:'+10% Thieving XP per rank.', valuePerRank:0.10, toggleable:false },
    { id:'masteryXP',  name:'Master Thief',      icon:'&#129693;', description:'+10% Thieving Mastery XP per rank.', valuePerRank:0.10, toggleable:false },
    { id:'masteryShare', name:'Shared Mastery', icon:'&#127760;', description:'Each rank adds 0.5% chance to trigger. On trigger, shares (1% + 0.5% per rank) of mastery XP to all other unlocked actions.', valuePerRank:0.005, toggleable:true },
    { id:'masteryAnchor', name:'Mastery Anchor', icon:'&#9889;', description:'Prestiging no longer fully resets mastery -- mastery levels at or below your rank are kept as-is; higher levels are capped down to your rank.', valuePerRank:1, toggleable:false, maxRank:99 },
    { id:'worker',     name:'Hire Thief',        icon:'&#129399;', description:'Passive thief steals every 8s. Rolls real success rate.', worker:true, baseCost:5 },
  ],
  fletching: [
    { id:'interval',    name:'Swift Fletcher',   icon:'&#127993;', description:'Reduces Fletching interval by 1% per rank.', valuePerRank:0.01, toggleable:false },
    { id:'bonusItem',   name:'Extra Fletch',      icon:'&#129432;', description:'5% chance per rank for bonus item.', valuePerRank:0.05, toggleable:false },
    { id:'preserveMats',name:'Careful Craft',    icon:'&#129454;', description:'0.5% chance per rank to preserve materials.', valuePerRank:0.005, toggleable:true , maxRank:200 },
    { id:'skillXP',     name:'Student of the Bow',icon:'&#128218;',description:'+10% Fletching XP per rank.', valuePerRank:0.10, toggleable:false },
    { id:'masteryXP',   name:'Master Fletcher',  icon:'&#127993;', description:'+10% Fletching Mastery XP per rank.', valuePerRank:0.10, toggleable:false },
    { id:'masteryShare', name:'Shared Mastery', icon:'&#127760;', description:'Each rank adds 0.5% chance to trigger. On trigger, shares (1% + 0.5% per rank) of mastery XP to all other unlocked actions.', valuePerRank:0.005, toggleable:true },
    { id:'masteryAnchor', name:'Mastery Anchor', icon:'&#9889;', description:'Prestiging no longer fully resets mastery -- mastery levels at or below your rank are kept as-is; higher levels are capped down to your rank.', valuePerRank:1, toggleable:false, maxRank:99 },
    { id:'worker',      name:'Hire Fletcher',    icon:'&#129485;', description:'Passive fletcher crafts every 5s. 25% XP.', worker:true, baseCost:5 },
  ],
  crafting: [
    { id:'interval',    name:'Master Crafter',   icon:'&#9874;',   description:'Reduces Crafting interval by 1% per rank.', valuePerRank:0.01, toggleable:false },
    { id:'bonusItem',   name:'Surplus Craft',    icon:'&#127890;', description:'5% chance per rank for bonus item.', valuePerRank:0.05, toggleable:false },
    { id:'preserveMats',name:'Material Efficiency',icon:'&#9851;', description:'0.5% chance per rank to preserve materials.', valuePerRank:0.005, toggleable:true , maxRank:200 },
    { id:'skillXP',     name:'Student of the Craft',icon:'&#128218;',description:'+10% Crafting XP per rank.', valuePerRank:0.10, toggleable:false },
    { id:'masteryXP',   name:'Master Artisan',   icon:'&#129717;', description:'+10% Crafting Mastery XP per rank.', valuePerRank:0.10, toggleable:false },
    { id:'masteryShare', name:'Shared Mastery', icon:'&#127760;', description:'Each rank adds 0.5% chance to trigger. On trigger, shares (1% + 0.5% per rank) of mastery XP to all other unlocked actions.', valuePerRank:0.005, toggleable:true },
    { id:'masteryAnchor', name:'Mastery Anchor', icon:'&#9889;', description:'Prestiging no longer fully resets mastery -- mastery levels at or below your rank are kept as-is; higher levels are capped down to your rank.', valuePerRank:1, toggleable:false, maxRank:99 },
    { id:'worker',      name:'Hire Artisan',     icon:'&#128296;', description:'Passive artisan crafts every 5s. 25% XP.', worker:true, baseCost:5 },
  ],
  runecrafting: [
    { id:'interval',    name:'Swift Runes',      icon:'&#128161;', description:'Reduces Runecrafting interval by 1% per rank.', valuePerRank:0.01, toggleable:false },
    { id:'bonusItem',   name:'Extra Runes',       icon:'&#10024;',  description:'5% chance per rank for bonus runes.', valuePerRank:0.05, toggleable:false },
    { id:'preserveMats',name:'Rune Conservation', icon:'&#9732;',   description:'0.5% chance per rank to preserve essence.', valuePerRank:0.005, toggleable:true , maxRank:200 },
    { id:'skillXP',     name:'Student of the Runes',icon:'&#128218;',description:'+10% Runecrafting XP per rank.', valuePerRank:0.10, toggleable:false },
    { id:'masteryXP',   name:'Master Runecrafter',icon:'&#129716;',description:'+10% Runecrafting Mastery XP per rank.', valuePerRank:0.10, toggleable:false },
    { id:'masteryShare', name:'Shared Mastery', icon:'&#127760;', description:'Each rank adds 0.5% chance to trigger. On trigger, shares (1% + 0.5% per rank) of mastery XP to all other unlocked actions.', valuePerRank:0.005, toggleable:true },
    { id:'masteryAnchor', name:'Mastery Anchor', icon:'&#9889;', description:'Prestiging no longer fully resets mastery -- mastery levels at or below your rank are kept as-is; higher levels are capped down to your rank.', valuePerRank:1, toggleable:false, maxRank:99 },
    { id:'worker',      name:'Hire Runecrafter', icon:'&#128296;', description:'Passive runecrafter crafts every 5s. 25% XP.', worker:true, baseCost:5 },
  ],
  herblore: [
    { id:'interval',    name:'Swift Brew',       icon:'&#129514;', description:'Reduces Herblore interval by 1% per rank.', valuePerRank:0.01, toggleable:false },
    { id:'bonusItem',   name:'Extra Potions',    icon:'&#127869;', description:'5% chance per rank for bonus potion.', valuePerRank:0.05, toggleable:false },
    { id:'preserveMats',name:'Herb Conservation',icon:'&#127807;', description:'0.5% chance per rank to preserve herbs.', valuePerRank:0.005, toggleable:true , maxRank:200 },
    { id:'skillXP',     name:'Student of Herbs', icon:'&#128218;', description:'+10% Herblore XP per rank.', valuePerRank:0.10, toggleable:false },
    { id:'masteryXP',   name:'Master Herbalist', icon:'&#129716;', description:'+10% Herblore Mastery XP per rank.', valuePerRank:0.10, toggleable:false },
    { id:'masteryShare', name:'Shared Mastery', icon:'&#127760;', description:'Each rank adds 0.5% chance to trigger. On trigger, shares (1% + 0.5% per rank) of mastery XP to all other unlocked actions.', valuePerRank:0.005, toggleable:true },
    { id:'masteryAnchor', name:'Mastery Anchor', icon:'&#9889;', description:'Prestiging no longer fully resets mastery -- mastery levels at or below your rank are kept as-is; higher levels are capped down to your rank.', valuePerRank:1, toggleable:false, maxRank:99 },
    { id:'worker',      name:'Hire Herbalist',   icon:'&#128296;', description:'Passive herbalist brews every 5s. 25% XP.', worker:true, baseCost:5 },
  ],
  summoning: [
    { id:'interval',    name:'Swift Summon',     icon:'&#129328;', description:'Reduces Summoning interval by 1% per rank.', valuePerRank:0.01, toggleable:false },
    { id:'bonusItem',   name:'Extra Tablets',    icon:'&#129435;', description:'5% chance per rank for bonus tablet.', valuePerRank:0.05, toggleable:false },
    { id:'preserveMats',name:'Shard Conservation',icon:'&#128142;',description:'0.5% chance per rank to preserve shards.', valuePerRank:0.005, toggleable:true , maxRank:200 },
    { id:'skillXP',     name:'Student of Summoning',icon:'&#128218;',description:'+10% Summoning XP per rank.', valuePerRank:0.10, toggleable:false },
    { id:'masteryXP',   name:'Master Conjurer',  icon:'&#129716;', description:'+10% Summoning Mastery XP per rank.', valuePerRank:0.10, toggleable:false },
    { id:'masteryShare', name:'Shared Mastery', icon:'&#127760;', description:'Each rank adds 0.5% chance to trigger. On trigger, shares (1% + 0.5% per rank) of mastery XP to all other unlocked actions.', valuePerRank:0.005, toggleable:true },
    { id:'masteryAnchor', name:'Mastery Anchor', icon:'&#9889;', description:'Prestiging no longer fully resets mastery -- mastery levels at or below your rank are kept as-is; higher levels are capped down to your rank.', valuePerRank:1, toggleable:false, maxRank:99 },
    { id:'worker',      name:'Hire Conjurer',    icon:'&#128296;', description:'Passive conjurer crafts every 5s. 25% XP.', worker:true, baseCost:5 },
  ],
  astrology: [
    { id:'interval',       name:'Star Gazer',        icon:'&#11088;',  description:'Reduces Astrology interval by 1% per rank.', valuePerRank:0.01, toggleable:false },
    { id:'bonusStardust',  name:'Stardust Collector', icon:'&#10024;',  description:'2% chance per rank for bonus Stardust, 1% for bonus Golden Stardust.', valuePerRank:0.02, toggleable:false },
    { id:'meteoriteChance',name:'Meteorite Hunter',  icon:'&#9732;',   description:'+1% Meteorite find chance per rank.', valuePerRank:0.01, toggleable:false },
    { id:'skillXP',        name:'Student of the Stars',icon:'&#128218;',description:'+10% Astrology XP per rank.', valuePerRank:0.10, toggleable:false },
    { id:'masteryXP',      name:'Master Astronomer', icon:'&#129716;', description:'+10% Astrology Mastery XP per rank.', valuePerRank:0.10, toggleable:false },
    { id:'masteryShare', name:'Shared Mastery', icon:'&#127760;', description:'Each rank adds 0.5% chance to trigger. On trigger, shares (1% + 0.5% per rank) of mastery XP to all other unlocked actions.', valuePerRank:0.005, toggleable:true },
    { id:'masteryAnchor', name:'Mastery Anchor', icon:'&#9889;', description:'Prestiging no longer fully resets mastery -- mastery levels at or below your rank are kept as-is; higher levels are capped down to your rank.', valuePerRank:1, toggleable:false, maxRank:99 },
    { id:'starAlignment',  name:'Star Alignment',    icon:'&#11088;',  description:'Every 10 min a random unlocked constellation blesses its linked skills: +20% XP and interval for 30s. Each rank adds 1s duration and reduces cooldown by 1%.', valuePerRank:1, toggleable:true },
    { id:'worker',         name:'Hire Scholar',      icon:'&#128302;', description:'Passive scholar studies selected constellation every 5s. 25% XP.', worker:true, baseCost:5 },
  ],
  agility: [
    { id:'interval',  name:'Swift Runner',      icon:'&#127939;', description:'Reduces Agility obstacle interval by 1% per rank.', valuePerRank:0.01, toggleable:false },
    { id:'skillXP',   name:'Endurance Training',icon:'&#128218;', description:'+10% Agility XP per rank.', valuePerRank:0.10, toggleable:false },
    { id:'masteryXP', name:'Course Mastery',    icon:'&#129716;', description:'+10% Agility Mastery XP per rank.', valuePerRank:0.10, toggleable:false },
    { id:'bonusGP',   name:'Treasure Hunter',   icon:'&#128176;', description:'5% chance per rank for bonus GP from obstacles.', valuePerRank:0.05, toggleable:false },
    { id:'negMult',   name:'Obstacle Mitigation',icon:'&#128737;',description:'-2% obstacle negative modifier multiplier per rank.', valuePerRank:0.02, toggleable:false },
    { id:'masteryShare', name:'Shared Mastery', icon:'&#127760;', description:'Each rank adds 0.5% chance to trigger. On trigger, shares (1% + 0.5% per rank) of mastery XP to all other unlocked actions.', valuePerRank:0.005, toggleable:true },
    { id:'masteryAnchor', name:'Mastery Anchor', icon:'&#9889;', description:'Prestiging no longer fully resets mastery -- mastery levels at or below your rank are kept as-is; higher levels are capped down to your rank.', valuePerRank:1, toggleable:false, maxRank:99 },
    { id:'worker',    name:'Hire Acrobat',      icon:'&#129338;', description:'Passive acrobat runs your course every 7s earning 25% XP+GP.', worker:true, baseCost:5 },
  ],
  farming: [
    { id:'interval',    name:'Green Thumb',       icon:'&#127807;', description:'Reduces crop growth time by 1% per rank.', valuePerRank:0.01, toggleable:false },
    { id:'bonusItem',   name:'Bountiful Harvest',  icon:'&#127807;', description:'5% chance per rank for a bonus crop on harvest.', valuePerRank:0.05, toggleable:false },
    { id:'preserveSeed',name:'Seed Conservation',  icon:'&#127809;', description:'5% chance per rank to not consume a seed when planting.', valuePerRank:0.05, toggleable:false , maxRank:20 },
    { id:'compostBonus',name:'Super Soil',         icon:'&#127807;', description:'+5% crop yield per rank when compost is used.', valuePerRank:0.05, toggleable:false },
    { id:'autoCompost', name:'Auto-Compost',       icon:'&#127981;', description:'5% chance per rank to auto-apply compost on harvest.', valuePerRank:0.05, toggleable:true , maxRank:20 },
    { id:'skillXP',     name:'Student of the Land',icon:'&#128218;', description:'+10% Farming XP per rank.', valuePerRank:0.10, toggleable:false },
    { id:'masteryXP',   name:'Master Farmer',      icon:'&#127807;', description:'+10% Farming Mastery XP per rank.', valuePerRank:0.10, toggleable:false },
    { id:'masteryShare',name:'Shared Mastery',     icon:'&#127760;', description:'Each rank adds 0.5% chance to trigger. On trigger, shares (1% + 0.5% per rank) of mastery XP to all other unlocked actions.', valuePerRank:0.005, toggleable:true },
    { id:'masteryAnchor', name:'Mastery Anchor', icon:'&#9889;', description:'Prestiging no longer fully resets mastery -- mastery levels at or below your rank are kept as-is; higher levels are capped down to your rank.', valuePerRank:1, toggleable:false, maxRank:99 },
    { id:'worker',      name:'Hire Farmhand',      icon:'&#129381;', description:'Passive farmhand harvests and replants your plots every 60s. 25% XP.', worker:true, baseCost:5 },
  ],
};

export function getUpgrades(skillId) { return SKILL_UPGRADES[skillId] ?? []; }
export function getUpgrade(skillId, upgradeId) { return getUpgrades(skillId).find(u => u.id === upgradeId) ?? null; }
export function getTotalBonus(upgradeId, rank, skillId) {
  const u = getUpgrade(skillId, upgradeId);
  return u ? u.valuePerRank * rank : 0;
}
export function getCost(currentRank, upgradeId) {
  if (upgradeId === 'preserveMats') return Math.min(Math.floor(currentRank / 2) + 1, 10);
  return Math.min(Math.floor(currentRank / 3) + 1, 10);
}
export function getWorkerCost(currentCount) {
  return Math.ceil(5 * Math.pow(1.33, currentCount));
}
export function formatBonus(upgradeId, rank, skillId) {
  const val = getTotalBonus(upgradeId, rank, skillId);
  if (upgradeId === 'healingBonus')   return `+${Math.round(val)}`;
  if (upgradeId === 'perception')     return `+${Math.round(val)}`;
  if (upgradeId === 'masteryAnchor')  return `Mastery Level ${rank} floor`;
  if (upgradeId === 'starAlignment') {
    const dur     = 30 + rank;           // 30s base + 1s per rank
    const cdSec   = Math.floor(600 * (1 - Math.min(rank * 0.01, 0.80)));
    const cdMin   = Math.floor(cdSec / 60);
    const cdS     = cdSec % 60;
    const cdStr   = cdMin > 0 ? `${cdMin}m ${cdS}s` : `${cdS}s`;
    return `${dur}s duration / ${cdStr} cooldown`;
  }
  return `${Math.round(val * 100)}%`;
}
