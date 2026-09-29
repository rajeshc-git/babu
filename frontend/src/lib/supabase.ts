import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://kkyzpswimjzmmuoavtha.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_8Y_LF-kpI79gk2R694O3yQ_Z-2KRRNS";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export interface SupabaseTribute {
  id?: string;
  name: string;
  relation?: string;
  message: string;
  created_at?: string;
}

// Fetch all live tributes from the Supabase database
export async function getSupabaseTributes(): Promise<SupabaseTribute[]> {
  try {
    const { data, error } = await supabase
      .from("shyamalchoudhury")
      .select("name, relation, message, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Supabase fetch error:", error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.warn("Supabase connection error:", err);
    return [];
  }
}

// Submit a new tribute directly to Supabase
export async function insertSupabaseTribute(
  name: string,
  relation: string,
  message: string
): Promise<{ success: boolean; data?: SupabaseTribute; error?: string }> {
  try {
    const payload = {
      name: name.trim(),
      relation: relation.trim() || "Well-wisher",
      message: message.trim(),
    };

    const { data, error } = await supabase
      .from("shyamalchoudhury")
      .insert([payload])
      .select();

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, data: data?.[0] || payload };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to submit tribute" };
  }
}

// Fetch 100% exact raw live Diya flames count from Supabase (no hardcoded offset)
export async function getSupabaseDiyaCount(): Promise<number> {
  try {
    const { count, error } = await supabase
      .from("diyas")
      .select("*", { count: "exact", head: true });

    if (error || typeof count !== "number") return 0;
    return count;
  } catch {
    return 0;
  }
}

// Light a diya in Supabase
export async function insertSupabaseDiya(name?: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("diyas")
      .insert([{ name: name || "Sanctuary Visitor" }]);
    return !error;
  } catch {
    return false;
  }
}

// Fetch all tribute reaction counts from Supabase (tribute_reactions table)
export async function getSupabaseReactions(): Promise<Record<string, number>> {
  try {
    const { data, error } = await supabase
      .from("tribute_reactions")
      .select("tribute_id, reaction_type");

    if (error || !data) {
      return {};
    }

    const counts: Record<string, number> = {};
    data.forEach((row: any) => {
      if (!row.tribute_id || !row.reaction_type) return;
      const key = `rx_${row.reaction_type}_${row.tribute_id}`;
      counts[key] = (counts[key] || 0) + 1;
    });

    return counts;
  } catch {
    return {};
  }
}

// Insert a tribute reaction (diya, flower, pranam) to Supabase
export async function insertSupabaseReaction(
  tributeId: string,
  reactionType: "diya" | "flower" | "pranam"
): Promise<boolean> {
  try {
    const { error } = await supabase.from("tribute_reactions").insert([
      {
        tribute_id: String(tributeId),
        reaction_type: reactionType,
      },
    ]);
    return !error;
  } catch {
    return false;
  }
}
