local TycoonConfig = {}

TycoonConfig.GameName = "Neon Noodle Tycoon"
TycoonConfig.Theme = "Cyberpunk ramen factory"

TycoonConfig.PlotCount = 4
TycoonConfig.PlotSpacing = 170
TycoonConfig.StartingCash = 400
TycoonConfig.IncomeTickSeconds = 1
TycoonConfig.AutoSaveInterval = 60

TycoonConfig.DataStoreName = "NeonNoodleTycoon_v2"

TycoonConfig.RebirthBaseCost = 150000
TycoonConfig.RebirthGrowth = 1.7
TycoonConfig.RebirthIncomeBonus = 0.18
TycoonConfig.RebirthShardRewardBase = 2
TycoonConfig.RebirthShardRewardGrowth = 0.35

TycoonConfig.OverclockMultiplier = 2.4
TycoonConfig.OverclockDuration = 20
TycoonConfig.OverclockCooldown = 75
TycoonConfig.OverclockUnlockId = "FusionControlHub"
TycoonConfig.ResearchUnlockId = "FlavorAI"

TycoonConfig.StarterUnlocks = { "BasicDropper" }

local unlockBlueprints = {
	{ Id = "BasicDropper", DisplayName = "Dropper Basique", Cost = 0, Income = 16, Starter = true, Color = Color3.fromRGB(64, 255, 214) },
	{ Id = "StreetBoiler", DisplayName = "Chaudiere de Rue", Cost = 450, Income = 34, Color = Color3.fromRGB(91, 150, 255) },
	{ Id = "NoodlePress", DisplayName = "Presse Nouilles", Cost = 950, Income = 58, Color = Color3.fromRGB(112, 200, 255) },
	{ Id = "SpiceInjector", DisplayName = "Injecteur Epices", Cost = 1800, MultiplierBonus = 0.16, Color = Color3.fromRGB(255, 141, 39) },
	{ Id = "RapidDropper", DisplayName = "Dropper Rapide", Cost = 3200, Income = 110, Color = Color3.fromRGB(120, 255, 197) },
	{ Id = "ConveyorMk2", DisplayName = "Convoyeur MK2", Cost = 5200, MultiplierBonus = 0.18, Color = Color3.fromRGB(0, 255, 255) },
	{ Id = "DroneChef", DisplayName = "Drone Chef", Cost = 7800, Income = 180, Color = Color3.fromRGB(255, 90, 245) },
	{ Id = "NanoBrothLab", DisplayName = "Lab Nano Bouillon", Cost = 12000, MultiplierBonus = 0.23, Color = Color3.fromRGB(126, 255, 126) },
	{ Id = "CrystalNoodleFarm", DisplayName = "Ferme Cristal", Cost = 18000, Income = 300, Color = Color3.fromRGB(124, 230, 255) },
	{ Id = "QuantumDropper", DisplayName = "Dropper Quantique", Cost = 26000, Income = 470, Color = Color3.fromRGB(163, 120, 255) },
	{ Id = "LaserSlicer", DisplayName = "Trancheur Laser", Cost = 36000, MultiplierBonus = 0.26, Color = Color3.fromRGB(255, 88, 88) },
	{ Id = "NeonMixer", DisplayName = "Melangeur Neon", Cost = 50000, Income = 700, Color = Color3.fromRGB(89, 247, 226) },
	{ Id = "TurboConveyor", DisplayName = "Turbo Convoyeur", Cost = 70000, MultiplierBonus = 0.32, Color = Color3.fromRGB(246, 255, 118) },
	{ Id = "FlavorAI", DisplayName = "IA des Saveurs", Cost = 98000, Income = 1050, Color = Color3.fromRGB(201, 155, 255) },
	{ Id = "FusionKettle", DisplayName = "Cuve Fusion", Cost = 135000, Income = 1450, Color = Color3.fromRGB(255, 174, 100) },
	{ Id = "ArcReactor", DisplayName = "Reacteur Arc", Cost = 185000, MultiplierBonus = 0.4, Color = Color3.fromRGB(113, 255, 178) },
	{ Id = "FlavorTower", DisplayName = "Tour Aromatique", Cost = 250000, Income = 2000, Color = Color3.fromRGB(84, 174, 255) },
	{ Id = "PlasmaSiphon", DisplayName = "Siphon Plasma", Cost = 340000, Income = 2700, Color = Color3.fromRGB(255, 95, 172) },
	{ Id = "ConveyorVortex", DisplayName = "Convoyeur Vortex", Cost = 460000, MultiplierBonus = 0.5, Color = Color3.fromRGB(153, 255, 255) },
	{ Id = "MegaNoodleCore", DisplayName = "Mega Noodle Core", Cost = 620000, Income = 3600, Color = Color3.fromRGB(255, 84, 84) },
	{ Id = "SkyKitchen", DisplayName = "Cuisine Orbitale", Cost = 840000, Income = 4700, Color = Color3.fromRGB(206, 227, 255) },
	{ Id = "GravityCooker", DisplayName = "Cuiseur Gravite", Cost = 1140000, MultiplierBonus = 0.58, Color = Color3.fromRGB(255, 218, 132) },
	{ Id = "NeutronDropper", DisplayName = "Dropper Neutron", Cost = 1540000, Income = 6200, Color = Color3.fromRGB(145, 195, 255) },
	{ Id = "IonSpiceArray", DisplayName = "Array Ion Epices", Cost = 2080000, Income = 7900, Color = Color3.fromRGB(255, 167, 243) },
	{ Id = "HyperConveyor", DisplayName = "Hyper Convoyeur", Cost = 2810000, MultiplierBonus = 0.72, Color = Color3.fromRGB(106, 255, 238) },
	{ Id = "FusionControlHub", DisplayName = "Hub Controle Fusion", Cost = 3790000, Income = 9800, Color = Color3.fromRGB(255, 121, 121) },
	{ Id = "PlanetaryKitchen", DisplayName = "Cuisine Planetaire", Cost = 5110000, Income = 12200, Color = Color3.fromRGB(150, 201, 255) },
	{ Id = "VoidBrothEngine", DisplayName = "Moteur Bouillon Void", Cost = 6890000, MultiplierBonus = 0.95, Color = Color3.fromRGB(194, 138, 255) },
	{ Id = "GalaxyNoodleForge", DisplayName = "Forge Galactique", Cost = 9290000, Income = 15000, Color = Color3.fromRGB(136, 255, 165) },
	{ Id = "PrestigeTerminal", DisplayName = "Terminal de Prestige", Cost = 12400000, Color = Color3.fromRGB(255, 225, 74) },
}

TycoonConfig.Unlocks = {}
local previousId = nil
for order, blueprint in ipairs(unlockBlueprints) do
	local col = (order - 1) % 6
	local row = math.floor((order - 1) / 6)
	local position = Vector3.new(-34 + col * 14, 3 + (row % 2) * 2, -30 + row * 16)
	local unlock = {
		Id = blueprint.Id,
		DisplayName = blueprint.DisplayName,
		Cost = blueprint.Cost,
		Income = blueprint.Income,
		MultiplierBonus = blueprint.MultiplierBonus,
		Order = order,
		Starter = blueprint.Starter == true,
		Requires = previousId and { previousId } or nil,
		BuildPosition = position,
		Color = blueprint.Color or Color3.fromRGB(255, 255, 255),
	}
	table.insert(TycoonConfig.Unlocks, unlock)
	previousId = blueprint.Id
end

TycoonConfig.ResearchUpgrades = {
	{
		Id = "FactoryOptimization",
		DisplayName = "Optimisation Usine",
		BaseCostShards = 4,
		CostGrowth = 1.6,
		MaxLevel = 12,
		EffectType = "income_multiplier",
		EffectPerLevel = 0.08,
	},
	{
		Id = "AutomationGrid",
		DisplayName = "Grille Automation",
		BaseCostShards = 8,
		CostGrowth = 1.7,
		MaxLevel = 10,
		EffectType = "income_multiplier",
		EffectPerLevel = 0.11,
	},
	{
		Id = "ProcurementAI",
		DisplayName = "IA Achat Materiaux",
		BaseCostShards = 6,
		CostGrowth = 1.65,
		MaxLevel = 10,
		EffectType = "cost_discount",
		EffectPerLevel = 0.025,
	},
	{
		Id = "OverclockMastery",
		DisplayName = "Maitrise Overclock",
		BaseCostShards = 10,
		CostGrowth = 1.75,
		MaxLevel = 8,
		EffectType = "overclock_duration",
		EffectPerLevel = 3,
	},
}

TycoonConfig.Milestones = {
	{ Id = "M1", TargetTotalEarnings = 25000, RewardCash = 5000, RewardShards = 1 },
	{ Id = "M2", TargetTotalEarnings = 100000, RewardCash = 20000, RewardShards = 2 },
	{ Id = "M3", TargetTotalEarnings = 300000, RewardCash = 55000, RewardShards = 2 },
	{ Id = "M4", TargetTotalEarnings = 750000, RewardCash = 120000, RewardShards = 3 },
	{ Id = "M5", TargetTotalEarnings = 1750000, RewardCash = 280000, RewardShards = 3 },
	{ Id = "M6", TargetTotalEarnings = 3500000, RewardCash = 520000, RewardShards = 4 },
	{ Id = "M7", TargetTotalEarnings = 6500000, RewardCash = 900000, RewardShards = 4 },
	{ Id = "M8", TargetTotalEarnings = 12000000, RewardCash = 1500000, RewardShards = 6 },
	{ Id = "M9", TargetTotalEarnings = 22000000, RewardCash = 2700000, RewardShards = 6 },
	{ Id = "M10", TargetTotalEarnings = 40000000, RewardCash = 4800000, RewardShards = 8 },
	{ Id = "M11", TargetTotalEarnings = 70000000, RewardCash = 8000000, RewardShards = 10 },
	{ Id = "M12", TargetTotalEarnings = 120000000, RewardCash = 13000000, RewardShards = 14 },
}

local unlockById = {}
for _, unlock in ipairs(TycoonConfig.Unlocks) do
	unlockById[unlock.Id] = unlock
end

local researchById = {}
for _, research in ipairs(TycoonConfig.ResearchUpgrades) do
	researchById[research.Id] = research
end

function TycoonConfig.GetUnlockById(unlockId)
	return unlockById[unlockId]
end

function TycoonConfig.GetResearchById(researchId)
	return researchById[researchId]
end

function TycoonConfig.GetResearchLevelCost(researchId, currentLevel)
	local research = researchById[researchId]
	if not research then
		return math.huge
	end
	if currentLevel >= research.MaxLevel then
		return math.huge
	end
	return math.floor(research.BaseCostShards * (research.CostGrowth ^ currentLevel))
end

function TycoonConfig.GetRebirthCost(rebirths)
	return math.floor(TycoonConfig.RebirthBaseCost * (TycoonConfig.RebirthGrowth ^ rebirths))
end

function TycoonConfig.GetRebirthShardReward(rebirths)
	return math.max(1, math.floor(TycoonConfig.RebirthShardRewardBase + rebirths * TycoonConfig.RebirthShardRewardGrowth))
end

return TycoonConfig
