# Common-Genmo
Common Generative Makeover: A Nano Banana Hackathon Submission.

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

Note: Only the code/file at services/geminiService.ts is licensed under BSD 3-Clause License, rest everything is Apcahe 2.0, so would advise to use that and this project as reference, and create something tranformative, if intent is on expanding or building something using it.

<p align="center">
    <img align="center" src="/public/sm.jpeg" alt="Common-Genmo" width="512" height="512"/>
</p>

x-post: https://x.com/dpawnlabs/status/1964938317168046470

submission-videos:

submission: https://www.youtube.com/watch?v=z5Bs9q9jEG4

demo: https://www.youtube.com/watch?v=q1Ht9SnsGFA

## Details:

# Generative MakeOver  

**Generative MakeOver** is a web demo application that lets users blend a portrait image with multiple “style element” images (clothing, accessories, background, vibe reference) to generate a new, photorealistic image. The result preserves the identity of the person while harmonizing the desired visual style elements. Users can iteratively refine, adjust, and download the final output.

This project was built as a hackathon submission using Google’s **Gemini 2.5 Flash Image** (aka *Nano Banana*) API for multimodal image generation and editing.

---

## 🚀 Features

- **Multi-reference fusion**: Combine a subject portrait with multiple style images (clothes, accessories, backgrounds) into a single coherent image.  
- **Identity consistency**: Maintain facial features, pose, and identity fidelity even when applying new visual elements.  
- **Iterative refinement**: Use “Refine with this Vibe” workflows to progressively adjust outputs using generated images as new references.  
- **Micro / macro edits**: Allow small or large changes (e.g. lighting, pose, color tweaks) via natural language instructions.  
- **Downloadable outputs**: Final images can be exported for further use.  
- **Clean UI**: Intuitive layout with slots for the portrait, style elements, and optional vibe / reference inputs.

---

## 📷 Why Gemini / Nano Banana

Generative MakeOver leverages **Gemini 2.5 Flash Image (Nano Banana)** for its advanced capabilities, including:

- **Multi-image to image composition & style transfer**: input multiple images and synthesize a fused result.  
- **Character / identity consistency** across edits — the model is designed to preserve subject features across transformations.
- **Natural language prompt + image editing**: you can mix text, images, and editing instructions in one request.  
- **SynthID watermarking**: all generated outputs include an invisible watermark (SynthID) to signal AI-generated origin.
- **Preview / developer access** via Gemini API / Vertex AI.

Because of these capabilities, the demo can behave at a higher semantic level (not just pixel blending) — making it possible to fuse multiple style sources with the subject portrait in plausible, coherent ways.

---

## 🧠 Technical Hypothesis (from creator’s design thinking)

Based on the creator’s remarks and what the public model spec allows, the system may be doing something like:

- **Semantic-level editing**: not just blending pixels, but understanding visual concepts across references (e.g. “jacket style”, “shoe texture”, “background mood”).  
- **Cross-attention over multi-reference latents**: encoding each style/reference image into a latent, then using cross-attention layers to reason across them and combine them with the subject.  
- **Spacetime / pseudo-temporal training**: treating multiple reference images as analogous to temporal frames (or synthetically generating intermediate frames) so the model learns coherence across them.  
- **Time-step distillation / denoising acceleration**: using distillation or student-teacher techniques to speed up inference while retaining fidelity.

While the exact internals of Google’s model are proprietary, these techniques are consistent with known approaches in the diffusion / image editing research community.

---
