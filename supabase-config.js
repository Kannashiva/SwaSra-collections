const SUPABASE_URL = "https://prasimuvunzkczampwku.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_BSVP4Mt5KBYWpsFwBRNiFw_8r33vt0T";


window.supabaseClient =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );