local TycoonConfig = {}

TycoonConfig.GameName = "Neon Noodle Tycoon"
TycoonConfig.Theme = "Cyberpunk ramen factory"

TycoonConfig.PlotCount = 4
TycoonConfig.PlotSpacing = 150
TycoonConfig.StartingCash = 250
TycoonConfig.IncomeTickSeconds = 1

TycoonConfig.DataStoreName = "NeonNoodleTycoon_v1"
TycoonConfig.AutoSaveInterval = 60

TycoonConfig.RebirthBaseCost = 100000
TycoonConfig.RebirthGrowth = 1.75
TycoonConfig.RebirthIncomeBonus = 0.20

TycoonConfig.StarterUnlocks = {
	"BasicDropper",
}

TycoonConfig.Unlocks = {
	{
		Id = "BasicDropper",
		DisplayName = "Dropper Basique",
		Cost = 0,
		Income = 10,
		Order = 1,
		Starter = true,
		BuildPosition = Vector3.new(-28, 3, -20),
		Color = Color3.fromRGB(64, 255, 214),
	},
	{
		Id = "FastDropper",
		DisplayName = "Dropper Rapide",
		Cost = 350,
		Income = 28,
		Order = 2,
		Requires = { "BasicDropper" },
		BuildPosition = Vector3.new(-16, 3, -20),
		Color = Color3.fromRGB(91, 150, 255),
	},
	{
		Id = "SpiceUpgrader",
		DisplayName = "Upgrader Epices",
		Cost = 900,
		MultiplierBonus = 0.25,
		Order = 3,
		Requires = { "FastDropper" },
		BuildPosition = Vector3.new(-2, 4, -22),
		Color = Color3.fromRGB(255, 141, 39),
	},
	{
		Id = "QuantumDropper",
		DisplayName = "Dropper Quantique",
		Cost = 1800,
		Income = 75,
		Order = 4,
		Requires = { "SpiceUpgrader" },
		BuildPosition = Vector3.new(12, 4, -20),
		Color = Color3.fromRGB(163, 120, 255),
	},
	{
		Id = "ConveyorV2",
		DisplayName = "Convoyeur V2",
		Cost = 2600,
		MultiplierBonus = 0.30,
		Order = 5,
		Requires = { "QuantumDropper" },
		BuildPosition = Vector3.new(26, 2, -10),
		Color = Color3.fromRGB(0, 255, 255),
	},
	{
		Id = "DroneChef",
		DisplayName = "Drone Chef Auto",
		Cost = 5000,
		Income = 210,
		Order = 6,
		Requires = { "ConveyorV2" },
		BuildPosition = Vector3.new(-20, 6, -2),
		Color = Color3.fromRGB(255, 90, 245),
	},
	{
		Id = "NanoBrothLab",
		DisplayName = "Laboratoire Nano-Bouillon",
		Cost = 9000,
		MultiplierBonus = 0.55,
		Order = 7,
		Requires = { "DroneChef" },
		BuildPosition = Vector3.new(-2, 5, 4),
		Color = Color3.fromRGB(126, 255, 126),
	},
	{
		Id = "CrystalFarm",
		DisplayName = "Ferme de Cristaux",
		Cost = 15000,
		Income = 480,
		Order = 8,
		Requires = { "NanoBrothLab" },
		BuildPosition = Vector3.new(18, 4, 2),
		Color = Color3.fromRGB(124, 230, 255),
	},
	{
		Id = "MegaNoodleCore",
		DisplayName = "Mega Noodle Core",
		Cost = 28000,
		Income = 1100,
		Order = 9,
		Requires = { "CrystalFarm" },
		BuildPosition = Vector3.new(0, 7, 18),
		Color = Color3.fromRGB(255, 84, 84),
	},
	{
		Id = "PrestigeTerminal",
		DisplayName = "Terminal de Prestige",
		Cost = 50000,
		Order = 10,
		Requires = { "MegaNoodleCore" },
		BuildPosition = Vector3.new(28, 4, 20),
		Color = Color3.fromRGB(255, 225, 74),
	},
}

local unlockById = {}
for _, unlock in ipairs(TycoonConfig.Unlocks) do
	unlockById[unlock.Id] = unlock
end

function TycoonConfig.GetUnlockById(unlockId)
	return unlockById[unlockId]
end

function TycoonConfig.GetRebirthCost(rebirths)
	return math.floor(TycoonConfig.RebirthBaseCost * (TycoonConfig.RebirthGrowth ^ rebirths))
end

return TycoonConfig
