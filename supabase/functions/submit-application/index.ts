import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ApplicationData {
  name: string;
  phone: string;
  email: string;
  message: string;
  video_url?: string;
  video_filename?: string;
  video_size?: number;
  video_uploaded_at?: string;
}

async function sendEmailNotification(applicationData: ApplicationData) {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");

  if (!resendApiKey) {
    console.error("RESEND_API_KEY not configured");
    return false;
  }

  try {
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "Ecoshield Recruiting <onboarding@resend.dev>",
        to: ["jshlug7@gmail.com"],
        subject: `New Application from ${applicationData.name}`,
        html: `
          <h2>New Sales Internship Application</h2>
          <p><strong>Name:</strong> ${applicationData.name}</p>
          <p><strong>Email:</strong> ${applicationData.email}</p>
          <p><strong>Phone:</strong> ${applicationData.phone}</p>
          <p><strong>Message:</strong></p>
          <p>${applicationData.message.replace(/\n/g, '<br>')}</p>
          ${applicationData.video_url ? `<p><strong>Video Application:</strong> <a href="${applicationData.video_url}">View Video</a></p>` : ''}
          <hr>
          <p>Log in to your dashboard to review this application and send them a Calendly link.</p>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text();
      console.error("Failed to send email:", errorData);
      return false;
    }

    console.log("Email notification sent successfully");
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const applicationData: ApplicationData = await req.json();

    const { name, phone, email, message, video_url, video_filename, video_size, video_uploaded_at } = applicationData;

    if (!name || !phone || !email || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const insertData: Record<string, unknown> = {
      name,
      phone,
      email,
      message,
      status: "new",
    };

    if (video_url) {
      insertData.video_url = video_url;
      insertData.video_filename = video_filename;
      insertData.video_size = video_size;
      insertData.video_uploaded_at = video_uploaded_at;
    }

    const { data, error } = await supabase
      .from("applications")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error("Error inserting application:", error);
      return new Response(
        JSON.stringify({ error: "Failed to submit application" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("New application submitted:", {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      message: data.message,
    });

    await sendEmailNotification(applicationData);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Application submitted successfully",
        applicationId: data.id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});