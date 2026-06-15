import { ImageResponse } from "next/og";
import { supabaseAdmin } from "@/lib/supabase-server";

export const runtime = "edge";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const leagueId = searchParams.get("liga");

    if (!leagueId) {
      return new Response("Liga ID is required", { status: 400 });
    }

    const { data: league } = await supabaseAdmin
      .from("leagues")
      .select("name")
      .eq("id", leagueId)
      .single();

    if (!league) {
      return new Response("Liga not found", { status: 404 });
    }

    const { data: members } = await supabaseAdmin
      .from("league_members")
      .select("user_id")
      .eq("league_id", leagueId);

    if (!members || members.length === 0) {
      return new Response("No members in league", { status: 404 });
    }

    const userIds = members.map((m) => m.user_id);

    const { data: users } = await supabaseAdmin
      .from("users")
      .select("name, total_points, avatar_url")
      .in("clerk_id", userIds)
      .order("total_points", { ascending: false })
      .limit(5);

    const rankings = users || [];

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
              marginBottom: "32px",
            }}
          >
            <div
              style={{
                fontSize: "48px",
                marginRight: "16px",
              }}
            >
              🏆
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  fontSize: "24px",
                  color: "#a3a3a3",
                  fontWeight: 500,
                }}
              >
                RANKING
              </div>
              <div
                style={{
                  fontSize: "36px",
                  color: "#fafafa",
                  fontWeight: 700,
                }}
              >
                {league.name}
              </div>
            </div>
          </div>

          {/* Rankings */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              flex: 1,
            }}
          >
            {rankings.map((user, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "16px 24px",
                  backgroundColor: index === 0 ? "#262626" : "#171717",
                  borderRadius: "16px",
                  border: index === 0 ? "2px solid #fbbf24" : "1px solid #262626",
                }}
              >
                <div
                  style={{
                    fontSize: "32px",
                    marginRight: "16px",
                    width: "48px",
                  }}
                >
                  {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}.`}
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                  }}
                >
                  <div
                    style={{
                      fontSize: "24px",
                      color: "#fafafa",
                      fontWeight: 600,
                    }}
                  >
                    {user.name}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: "28px",
                    color: index === 0 ? "#fbbf24" : "#a3a3a3",
                    fontWeight: 700,
                  }}
                >
                  {user.total_points} pts
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "32px",
            }}
          >
            <div
              style={{
                fontSize: "20px",
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
    console.error("OG Image error:", error);
    return new Response("Failed to generate image", { status: 500 });
  }
}
