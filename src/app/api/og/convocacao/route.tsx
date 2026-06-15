import { ImageResponse } from "next/og";
import { supabaseAdmin } from "@/lib/supabase-server";

export const runtime = "edge";

const FLAGS: Record<string, string> = {
  BRA: "🇧🇷", ARG: "🇦🇷", URU: "🇺🇾", PAR: "🇵🇾", CHI: "🇨🇱", COL: "🇨🇴",
  PER: "🇵🇪", ECU: "🇪🇨", VEN: "🇻🇪", BOL: "🇧🇴", MEX: "🇲🇽", USA: "🇺🇸",
  CAN: "🇨🇦", CRC: "🇨🇷", HON: "🇭🇳", JAM: "🇯🇲", PAN: "🇵🇦", GER: "🇩🇪",
  FRA: "🇫🇷", ESP: "🇪🇸", ENG: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", ITA: "🇮🇹", POR: "🇵🇹", NED: "🇳🇱",
  BEL: "🇧🇪", CRO: "🇭🇷", SUI: "🇨🇭", POL: "🇵🇱", DEN: "🇩🇰", SRB: "🇷🇸",
  WAL: "🏴󠁧󠁢󠁷󠁬󠁳󠁿", SCO: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", AUT: "🇦🇹", UKR: "🇺🇦", SWE: "🇸🇪",
  JPN: "🇯🇵", KOR: "🇰🇷", AUS: "🇦🇺", IRN: "🇮🇷", QAT: "🇶🇦", KSA: "🇸🇦",
  SEN: "🇸🇳", GHA: "🇬🇭", CMR: "🇨🇲", MAR: "🇲🇦", TUN: "🇹🇳", NGA: "🇳🇬",
  EGY: "🇪🇬", ALG: "🇩🇿", CIV: "🇨🇮", RSA: "🇿🇦",
};

function getFlag(code: string): string {
  return FLAGS[code] || "🏳️";
}

function formatDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  };
  return new Intl.DateTimeFormat("pt-BR", options).format(date);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const matchId = searchParams.get("jogo");
    const leagueId = searchParams.get("liga");

    if (!matchId) {
      return new Response("Match ID is required", { status: 400 });
    }

    let leagueName = "";
    if (leagueId) {
      const { data: league } = await supabaseAdmin
        .from("leagues")
        .select("name")
        .eq("id", leagueId)
        .single();
      leagueName = league?.name || "";
    }

    const apiResponse = await fetch(`https://wc2026.moothz.win/games/${matchId}`);
    
    if (!apiResponse.ok) {
      return new Response("Match not found", { status: 404 });
    }

    const matchData = await apiResponse.json();
    const game = matchData.data;

    if (!game) {
      return new Response("Match not found", { status: 404 });
    }

    const teamsResponse = await fetch("https://wc2026.moothz.win/teams");
    const teamsData = await teamsResponse.json();
    
    interface Team {
      id: number;
      code: string;
      name_en: string;
    }
    
    const teamsMap = new Map<number, Team>(
      teamsData.data.map((t: Team) => [t.id, t])
    );

    const homeTeam = teamsMap.get(game.home_team_id);
    const awayTeam = teamsMap.get(game.away_team_id);

    const homeCode = homeTeam?.code || "???";
    const awayCode = awayTeam?.code || "???";
    const homeName = homeTeam?.name_en || "TBD";
    const awayName = awayTeam?.name_en || "TBD";

    const matchDate = game.local_date 
      ? new Date(game.date)
      : new Date();

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#0a0a0a",
            padding: "48px",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "24px",
            }}
          >
            <div style={{ fontSize: "40px", marginRight: "12px" }}>⚽</div>
            <div
              style={{
                fontSize: "28px",
                color: "#fafafa",
                fontWeight: 700,
              }}
            >
              CONVOCAÇÃO
            </div>
          </div>

          {/* Match */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
              backgroundColor: "#171717",
              borderRadius: "24px",
              padding: "40px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "40px",
                marginBottom: "24px",
              }}
            >
              {/* Home Team */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <div style={{ fontSize: "64px" }}>{getFlag(homeCode)}</div>
                <div
                  style={{
                    fontSize: "24px",
                    color: "#fafafa",
                    fontWeight: 600,
                    marginTop: "8px",
                  }}
                >
                  {homeName}
                </div>
              </div>

              {/* VS */}
              <div
                style={{
                  fontSize: "32px",
                  color: "#737373",
                  fontWeight: 700,
                }}
              >
                vs
              </div>

              {/* Away Team */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <div style={{ fontSize: "64px" }}>{getFlag(awayCode)}</div>
                <div
                  style={{
                    fontSize: "24px",
                    color: "#fafafa",
                    fontWeight: 600,
                    marginTop: "8px",
                  }}
                >
                  {awayName}
                </div>
              </div>
            </div>

            {/* Date */}
            <div
              style={{
                fontSize: "20px",
                color: "#a3a3a3",
                marginBottom: "16px",
              }}
            >
              {formatDate(matchDate)}
            </div>

            {/* League */}
            {leagueName && (
              <div
                style={{
                  fontSize: "18px",
                  color: "#737373",
                  backgroundColor: "#262626",
                  padding: "8px 16px",
                  borderRadius: "999px",
                }}
              >
                Liga: {leagueName}
              </div>
            )}
          </div>

          {/* CTA */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "32px",
            }}
          >
            <div
              style={{
                fontSize: "24px",
                color: "#fbbf24",
                fontWeight: 700,
              }}
            >
              Faça seu Chute! 🎯
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "16px",
            }}
          >
            <div
              style={{
                fontSize: "18px",
                color: "#737373",
              }}
            >
              bolaocopa.fun
            </div>
          </div>
        </div>
      ),
      {
        width: 600,
        height: 600,
      }
    );
  } catch (error) {
    console.error("OG Convocacao error:", error);
    return new Response("Failed to generate image", { status: 500 });
  }
}
