local ReplicatedStorage = game:GetService("ReplicatedStorage")

local sharedFolder = ReplicatedStorage:WaitForChild("Shared")
local configFolder = sharedFolder:WaitForChild("Config")
local TycoonConfig = require(configFolder:WaitForChild("TycoonConfig"))

local TycoonFactory = {}

local function createPart(name, size, cframe, color, material, parent)
	local part = Instance.new("Part")
	part.Name = name
	part.Size = size
	part.CFrame = cframe
	part.Color = color
	part.Material = material
	part.Anchored = true
	part.TopSurface = Enum.SurfaceType.Smooth
	part.BottomSurface = Enum.SurfaceType.Smooth
	part.Parent = parent
	return part
end

local function createBillboard(parent, text, textColor)
	local billboard = Instance.new("BillboardGui")
	billboard.Name = "Billboard"
	billboard.Size = UDim2.fromOffset(220, 70)
	billboard.StudsOffset = Vector3.new(0, 4, 0)
	billboard.AlwaysOnTop = true
	billboard.Parent = parent

	local label = Instance.new("TextLabel")
	label.Name = "Label"
	label.Size = UDim2.fromScale(1, 1)
	label.BackgroundTransparency = 1
	label.TextScaled = true
	label.Font = Enum.Font.GothamBold
	label.TextColor3 = textColor
	label.TextStrokeTransparency = 0.5
	label.Text = text
	label.Parent = billboard

	return label
end

local function createPrompt(parent, actionText, objectText)
	local prompt = Instance.new("ProximityPrompt")
	prompt.Name = "Prompt"
	prompt.ActionText = actionText
	prompt.ObjectText = objectText
	prompt.HoldDuration = 0.15
	prompt.MaxActivationDistance = 12
	prompt.RequiresLineOfSight = false
	prompt.Parent = parent
	return prompt
end

function TycoonFactory.ResetPlotBuild(plot)
	for _, child in ipairs(plot.BuildFolder:GetChildren()) do
		child:Destroy()
	end
end

function TycoonFactory.SetOwnerVisual(plot, ownerText, color)
	plot.SignLabel.Text = ownerText
	plot.SignLabel.TextColor3 = color
end

function TycoonFactory.SetButtonState(plot, unlockId, state, displayName, cost)
	local button = plot.ButtonsById[unlockId]
	if not button then
		return
	end

	if state == "hidden" then
		button.Part.Transparency = 1
		button.Part.CanCollide = false
		button.Prompt.Enabled = false
		button.Label.Text = displayName
		return
	end

	if state == "locked" then
		button.Part.Transparency = 0.85
		button.Part.CanCollide = false
		button.Prompt.Enabled = false
		button.Label.Text = ("[LOCKED] %s"):format(displayName)
		return
	end

	button.Part.Transparency = 0.2
	button.Part.CanCollide = true
	button.Prompt.Enabled = true
	button.Prompt.ActionText = ("Acheter $%d"):format(cost)
	button.Label.Text = ("%s\n$%d"):format(displayName, cost)
end

function TycoonFactory.SetResearchState(plot, researchId, state, displayName, currentLevel, maxLevel, costShards)
	local research = plot.ResearchById[researchId]
	if not research then
		return
	end

	if state == "hidden" then
		research.Part.Transparency = 1
		research.Part.CanCollide = false
		research.Prompt.Enabled = false
		research.Label.Text = displayName
		return
	end

	if state == "locked" then
		research.Part.Transparency = 0.8
		research.Part.CanCollide = false
		research.Prompt.Enabled = false
		research.Label.Text = ("[LOCKED] %s L%d/%d"):format(displayName, currentLevel, maxLevel)
		return
	end

	if state == "maxed" then
		research.Part.Transparency = 0.3
		research.Part.CanCollide = false
		research.Prompt.Enabled = false
		research.Label.Text = ("[MAX] %s L%d/%d"):format(displayName, currentLevel, maxLevel)
		return
	end

	research.Part.Transparency = 0.15
	research.Part.CanCollide = true
	research.Prompt.Enabled = true
	research.Prompt.ActionText = ("Upgrade %d shards"):format(costShards)
	research.Label.Text = ("%s\nL%d/%d - %d shards"):format(displayName, currentLevel, maxLevel, costShards)
end

function TycoonFactory.SetOverclockState(plot, text, enabled, color)
	plot.OverclockPrompt.Enabled = enabled
	plot.OverclockLabel.Text = text
	if color then
		plot.OverclockPad.Color = color
	end
end

function TycoonFactory.SetPlotUnclaimed(plot)
	plot.OwnerUserId = nil
	plot.ClaimPrompt.Enabled = true
	plot.CollectorPrompt.Enabled = false
	plot.RebirthPrompt.Enabled = false
	plot.OverclockPrompt.Enabled = false
	plot.OverclockLabel.Text = "Overclock verrouille"
	TycoonFactory.SetOwnerVisual(plot, "PLOT LIBRE", Color3.fromRGB(255, 255, 255))
	for unlockId, button in pairs(plot.ButtonsById) do
		button.Part.Transparency = 1
		button.Prompt.Enabled = false
		button.Label.Text = unlockId
	end
	for researchId, research in pairs(plot.ResearchById) do
		research.Part.Transparency = 1
		research.Prompt.Enabled = false
		research.Label.Text = researchId
	end
	TycoonFactory.ResetPlotBuild(plot)
end

function TycoonFactory.BuildUnlock(plot, unlock)
	if plot.BuildFolder:FindFirstChild(unlock.Id) then
		return
	end

	local model = Instance.new("Model")
	model.Name = unlock.Id
	model.Parent = plot.BuildFolder

	local baseCFrame = CFrame.new(plot.Origin + unlock.BuildPosition)
	local color = unlock.Color or Color3.fromRGB(255, 255, 255)

	local base = createPart(
		"Core",
		Vector3.new(8, 6, 8),
		baseCFrame,
		color,
		Enum.Material.Neon,
		model
	)

	if unlock.Income and unlock.Income > 0 then
		createPart(
			"Emitter",
			Vector3.new(2, 4, 2),
			base.CFrame * CFrame.new(0, 5, 0),
			Color3.fromRGB(255, 255, 255),
			Enum.Material.SmoothPlastic,
			model
		)
	end

	if unlock.MultiplierBonus and unlock.MultiplierBonus > 0 then
		createPart(
			"Ring",
			Vector3.new(10, 1, 10),
			base.CFrame * CFrame.new(0, 3, 0),
			Color3.fromRGB(255, 198, 66),
			Enum.Material.Neon,
			model
		)
	end

	local labelText = ("%s"):format(unlock.DisplayName)
	createBillboard(base, labelText, Color3.fromRGB(255, 255, 255))
end

function TycoonFactory.CreateWorld()
	local old = workspace:FindFirstChild("NeonNoodleTycoonWorld")
	if old then
		old:Destroy()
	end

	local root = Instance.new("Folder")
	root.Name = "NeonNoodleTycoonWorld"
	root.Parent = workspace

	local ground = createPart(
		"Ground",
		Vector3.new(900, 1, 900),
		CFrame.new(0, -2, 0),
		Color3.fromRGB(15, 16, 22),
		Enum.Material.Slate,
		root
	)
	ground.CastShadow = false

	local plots = {}
	local columns = 2
	local rows = math.ceil(TycoonConfig.PlotCount / columns)
	local xStart = -((columns - 1) * TycoonConfig.PlotSpacing) / 2
	local zStart = -((rows - 1) * TycoonConfig.PlotSpacing) / 2

	for index = 1, TycoonConfig.PlotCount do
		local row = math.floor((index - 1) / columns)
		local col = (index - 1) % columns
		local origin = Vector3.new(xStart + col * TycoonConfig.PlotSpacing, 0, zStart + row * TycoonConfig.PlotSpacing)

		local plotModel = Instance.new("Model")
		plotModel.Name = ("Plot_%d"):format(index)
		plotModel.Parent = root

		local floor = createPart(
			"Floor",
			Vector3.new(140, 1, 140),
			CFrame.new(origin + Vector3.new(0, 0, 0)),
			Color3.fromRGB(22, 25, 35),
			Enum.Material.Metal,
			plotModel
		)

		local claimPad = createPart(
			"ClaimPad",
			Vector3.new(12, 1, 12),
			CFrame.new(origin + Vector3.new(-50, 1, 54)),
			Color3.fromRGB(67, 255, 170),
			Enum.Material.Neon,
			plotModel
		)
		local claimPrompt = createPrompt(claimPad, "Prendre", "Tycoon libre")

		local collector = createPart(
			"Collector",
			Vector3.new(12, 1, 12),
			CFrame.new(origin + Vector3.new(50, 1, 54)),
			Color3.fromRGB(255, 226, 87),
			Enum.Material.Neon,
			plotModel
		)
		local collectorPrompt = createPrompt(collector, "Collecter", "Cash non collecte")
		collectorPrompt.Enabled = false

		local rebirthPad = createPart(
			"RebirthPad",
			Vector3.new(14, 1, 14),
			CFrame.new(origin + Vector3.new(50, 1, -54)),
			Color3.fromRGB(255, 94, 94),
			Enum.Material.Neon,
			plotModel
		)
		local rebirthPrompt = createPrompt(rebirthPad, "Renaitre", "Prestige")
		rebirthPrompt.Enabled = false

		local overclockPad = createPart(
			"OverclockPad",
			Vector3.new(14, 1, 14),
			CFrame.new(origin + Vector3.new(0, 1, 56)),
			Color3.fromRGB(136, 175, 255),
			Enum.Material.Neon,
			plotModel
		)
		local overclockPrompt = createPrompt(overclockPad, "Overclock", "Boost temporaire")
		overclockPrompt.Enabled = false
		local overclockLabel = createBillboard(overclockPad, "Overclock verrouille", Color3.fromRGB(255, 255, 255))

		local sign = createPart(
			"OwnerSign",
			Vector3.new(28, 10, 2),
			CFrame.new(origin + Vector3.new(-50, 8, 60)),
			Color3.fromRGB(44, 51, 73),
			Enum.Material.Metal,
			plotModel
		)
		local signLabel = createBillboard(sign, "PLOT LIBRE", Color3.fromRGB(255, 255, 255))

		local buildFolder = Instance.new("Folder")
		buildFolder.Name = "Build"
		buildFolder.Parent = plotModel

		local buttonFolder = Instance.new("Folder")
		buttonFolder.Name = "Buttons"
		buttonFolder.Parent = plotModel

		local buttonsById = {}
		local nonStarterUnlocks = {}
		for _, unlock in ipairs(TycoonConfig.Unlocks) do
			if not unlock.Starter then
				table.insert(nonStarterUnlocks, unlock)
			end
		end

		local totalButtons = #nonStarterUnlocks
		for buttonIndex, unlock in ipairs(nonStarterUnlocks) do
			local angle = ((buttonIndex - 1) / math.max(1, totalButtons)) * math.pi * 2
			local radius = 50
			local position = origin + Vector3.new(math.cos(angle) * radius, 1, math.sin(angle) * radius)
			local buttonPart = createPart(
				("Button_%s"):format(unlock.Id),
				Vector3.new(8, 1, 8),
				CFrame.new(position),
				unlock.Color or Color3.fromRGB(255, 255, 255),
				Enum.Material.Neon,
				buttonFolder
			)
			buttonPart.Transparency = 1
			buttonPart.CanCollide = false

			local prompt = createPrompt(buttonPart, "Acheter", unlock.DisplayName)
			prompt.Enabled = false

			local label = createBillboard(buttonPart, unlock.DisplayName, Color3.fromRGB(255, 255, 255))
			buttonsById[unlock.Id] = {
				Part = buttonPart,
				Prompt = prompt,
				Label = label,
			}
		end

		local researchFolder = Instance.new("Folder")
		researchFolder.Name = "Research"
		researchFolder.Parent = plotModel

		local researchById = {}
		local researchCount = #TycoonConfig.ResearchUpgrades
		for researchIndex, researchUpgrade in ipairs(TycoonConfig.ResearchUpgrades) do
			local spread = 100 / math.max(1, researchCount - 1)
			local xOffset = -50 + (researchIndex - 1) * spread
			local position = origin + Vector3.new(xOffset, 1, -56)
			local researchPart = createPart(
				("Research_%s"):format(researchUpgrade.Id),
				Vector3.new(16, 1, 10),
				CFrame.new(position),
				Color3.fromRGB(255, 133, 244),
				Enum.Material.Neon,
				researchFolder
			)
			researchPart.Transparency = 1
			researchPart.CanCollide = false

			local prompt = createPrompt(researchPart, "Upgrade", researchUpgrade.DisplayName)
			prompt.Enabled = false

			local label = createBillboard(researchPart, researchUpgrade.DisplayName, Color3.fromRGB(255, 255, 255))
			researchById[researchUpgrade.Id] = {
				Part = researchPart,
				Prompt = prompt,
				Label = label,
			}
		end

		plots[index] = {
			Index = index,
			Model = plotModel,
			Floor = floor,
			Origin = origin,
			OwnerUserId = nil,
			SignLabel = signLabel,
			ClaimPrompt = claimPrompt,
			CollectorPrompt = collectorPrompt,
			RebirthPrompt = rebirthPrompt,
			OverclockPad = overclockPad,
			OverclockPrompt = overclockPrompt,
			OverclockLabel = overclockLabel,
			ButtonsById = buttonsById,
			ResearchById = researchById,
			BuildFolder = buildFolder,
		}

		TycoonFactory.SetPlotUnclaimed(plots[index])
	end

	return root, plots
end

return TycoonFactory
