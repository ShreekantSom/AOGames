-- Updated 2024.9.12 Finished.

local json = require("json")

Scores = Scores or {}

-- Scores table list stores the all users address and scores.
-- Running target ID: Pq_u3ImiBUODJgH3XCm1dMvwL3AKU-8RIEhfLI3GXrk

-- Check the address if in Scores list.
local function findKeyInTable(tbl, key)
    for k, v in pairs(tbl) do
        if k == key then
            return true
        end
    end
    return false
end

-- Sort function, max to min
local function sortFunction(a, b)
   return a.value > b.value
end

-- At Frontend, jungle the score of the user, if a new high score. If yes, call update. If no, donot call.
-- aos>Send({ Target = "Pq_u3ImiBUODJgH3XCm1dMvwL3AKU-8RIEhfLI3GXrk", Action = "UpdateScore", Data = '{"address": "0x07","score":"100"}'})

Handlers.add(
    "UpdateScore",
    Handlers.utils.hasMatchingTag("Action","UpdateScore"),
    function (msg)
        local dataJson = json.decode(msg.Data)
        local useraddr = dataJson.address
        local userscore = dataJson.score
        Scores[useraddr] = userscore
        Handlers.utils.reply("Updated"..useraddr..userscore)(msg)
    end
)

-- QueryScore for the address's scores
-- aos>Send({ Target = "Pq_u3ImiBUODJgH3XCm1dMvwL3AKU-8RIEhfLI3GXrk", Action = "QueryScore", Data = '{"address": "0x02"}'})

Handlers.add(
    "QueryScore",
    Handlers.utils.hasMatchingTag("Action","QueryScore"),
    function (msg)
        local dataJson = json.decode(msg.Data)
        local addr = dataJson.address
        if findKeyInTable(Scores, addr) then
            -- print("User exists")
            local userScore = Scores[addr]
            Handlers.utils.reply(tostring(userScore))(msg)
        else
            -- print("User does not exist")
            Handlers.utils.reply('0')(msg)
        end
    end
)

-- QueryLeaderboard for all scores
-- aos>Send({ Target = "Pq_u3ImiBUODJgH3XCm1dMvwL3AKU-8RIEhfLI3GXrk", Action = "QueryLeaderboard"})

Handlers.add(
    "QueryLeaderboard",
    Handlers.utils.hasMatchingTag("Action","QueryLeaderboard"),        
    function (msg)
        local tempArray = {}
        for key, value in pairs(Scores) do
            table.insert(tempArray, {key = key, value = tonumber(value)})
        end
        
        -- sort the Scores table
        table.sort(tempArray, sortFunction)
        
        -- create leaderboard table 
        local leaderboard = {}
        local count = 1
        for key, value in pairs(tempArray) do
            if count <= 5 then
                leaderboard[key] = value
            else
                break
            end
            count = count + 1
        end

        -- Replay the leaderboard table
        local leaderboardJson = json.encode(leaderboard)
        Handlers.utils.reply(leaderboardJson)(msg)
    end
)