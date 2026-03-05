local MonetizationConfig = {}

MonetizationConfig.Enabled = true

MonetizationConfig.GamePasses = {
	VipIncomeX2 = {
		Id = 0,
		DisplayName = "VIP x2 revenu",
		PerkType = "income_multiplier",
		Multiplier = 2,
	},
	AutoCollector = {
		Id = 0,
		DisplayName = "Auto Collect",
		PerkType = "auto_collect",
	},
}

MonetizationConfig.DeveloperProducts = {
	CashSmall = {
		Id = 0,
		DisplayName = "Cash Pack S",
		RewardCash = 2500,
	},
	CashMedium = {
		Id = 0,
		DisplayName = "Cash Pack M",
		RewardCash = 10000,
	},
	CashLarge = {
		Id = 0,
		DisplayName = "Cash Pack L",
		RewardCash = 50000,
	},
	InstantRebirth = {
		Id = 0,
		DisplayName = "Instant Rebirth",
		RewardRebirth = true,
	},
}

function MonetizationConfig.BuildLookupById(items)
	local byId = {}
	for key, item in pairs(items) do
		if type(item.Id) == "number" and item.Id > 0 then
			byId[item.Id] = {
				Key = key,
				Data = item,
			}
		end
	end
	return byId
end

return MonetizationConfig
