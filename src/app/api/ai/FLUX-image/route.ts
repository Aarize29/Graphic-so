export const maxDuration = 300;
import { db } from "@/lib/db";
import Replicate from "replicate";

export async function POST(req: Request, res: Response) {
  //TODO: Add security checks with clerk
  try {
    const {
      prompt,
      userid,
      temperature,
      num_outputs,
      aspect_ratio,
      output_format,
      guidance_scale,
      output_quality,
      num_inference_steps,
    } = await req.json();

    if (!userid && !prompt) {
      return new Response("API key and prompt is required", {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    const dbUser = await db.user.findFirst({
      where: {
        clerkId: userid,
      },
    });

    if (Number(dbUser?.credits) < 1) {
      return new Response("Insufficient credits", {
        status: 402,
        headers: { "Content-Type": "application/json" },
      });
    }

    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_KEY,
    });

    const guidanceScaleNumber = parseFloat(guidance_scale);
    const numInferenceStepsInt = parseInt(num_inference_steps, 10);
    const numOutputsInt = parseInt(num_outputs, 10);
    const outputQualityInt = parseInt(output_quality, 10);

    const output = await replicate.run(
      "lucataco/flux-dev-lora:a22c463f11808638ad5e2ebd582e07a469031f48dd567366fb4c6fdab91d614d",
      {
        input: {
          prompt: prompt,
          hf_lora: "alvdansen/frosting_lane_flux",
          temperature: temperature || 0.5,
          aspect_ratio: aspect_ratio || "1:1",
          output_format: output_format || "webp",
          guidance_scale: guidanceScaleNumber || 3.5,
          num_inference_steps: numInferenceStepsInt || 20,
          num_outputs: numOutputsInt | 1,
          output_quality: outputQualityInt || 80,
        },
      }
    );

    console.log("Flux output :", output);
    await db.user.update({
      where: {
        clerkId: userid,
      },
      data: {
        credits: (Number(dbUser?.credits) - 1).toString(),
      },
    });
    const finaloutput = JSON.stringify(output);
    return new Response(finaloutput, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error during Replicate API call:", error);
    return new Response("error", {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
