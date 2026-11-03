import { useState } from 'react';
import type { FC } from 'react';
import { 
  BookOpen, 
  Layers, 
  Eye, 
  Activity, 
  HelpCircle, 
  AlertTriangle, 
  Cpu,
  ShieldAlert
} from 'lucide-react';

export const ExplainabilityGuide: FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<string>('frequency-domain');

  const topics = [
    {
      id: 'frequency-domain',
      title: '2D-FFT Fourier & Frequency Domain Anomalies',
      icon: Activity,
      summary: 'Why generative upsamplers leave mathematical frequency checkerboard signatures.',
      content: `Generative models (GANs, diffusion architectures including Stable Diffusion, Midjourney, StyleGAN, and Flux) construct images by successively upsampling latent feature matrices. In intermediate stages, transposed convolution (deconvolution) operations introduce regular mathematical periodicities across pixel grids.\n\nWhile invisible to the naked eye in standard RGB space, computing the 2D Fast Fourier Transform (FFT) decomposes the spatial matrix into its spatial frequency components. The repetitive spatial upsampling patterns manifest as prominent high-frequency cross-hatch spikes, starburst spokes, or concentric ripples.\n\nNatural camera optics and optical glass lenses do not generate periodic frequency lattices; real sensor noise smoothly decays following a natural 1/f power spectrum.`
    },
    {
      id: 'facial-seams',
      title: 'Boundary Blending & Warping Gradients',
      icon: Layers,
      summary: 'Detecting spatial edge discontinuities in face-swap composites.',
      content: `Face-swap tools (DeepFaceLab, SimSwap, Roop) extract a source face, synthesize an aligned facial pose, and composite it onto the original frame. To mask hard edges, algorithms apply Gaussian feathering or Poisson gradient blending.\n\nHowever, blending creates a localized drop in spatial sharpness right at the composite seam (along the jawline, forehead hairline, and neck). Our forensic inspection evaluates discrepancies between the micro-grain sensor noise of the face versus the background camera sensor.`
    },
    {
      id: 'ocular-symmetry',
      title: 'Corneal Specular Reflection Physics',
      icon: Eye,
      summary: 'Evaluating bilateral illumination geometry across reflective eyes.',
      content: `Human eyes are reflective spherical surfaces. In real photography captured under ambient light (e.g., sun, studio flash, window), the specular highlight on the left cornea and right cornea must obey 3D optical physics regarding angle, shape, and intensity.\n\nGenerative AI models synthesize each facial sub-region statistically rather than solving 3D ray-tracing physics. Consequently, synthetic portraits frequently render inconsistent pupil outlines, distorted specular reflections, or highlights pointing toward contradictory virtual light sources.`
    },
    {
      id: 'video-temporal',
      title: 'Video Keyframe & Temporal Flow Jitter',
      icon: Cpu,
      summary: 'Why deepfake video flickers across rapid head rotations.',
      content: `Generating a deepfake video requires frame-by-frame synthesis. Even with optical flow regularization, micro-misalignments occur during rapid head turns, eye blinks, or occlusion (such as a hand passing in front of the face).\n\nThis introduces high-frequency temporal flickering—a rapid variation in pixel values from frame N to N+1 that exceeds natural biological movement dynamics.`
    },
    {
      id: 'uncertainty-limits',
      title: 'Why Results May Be Inconclusive',
      icon: AlertTriangle,
      summary: 'Understanding compression degradation, low resolution, and lens blur.',
      content: `Automated detection encounters genuine uncertainty when:\n1. Social Media Compression: Platforms like WhatsApp and Instagram re-encode images with aggressive JPEG quantization, wiping out fine Fourier signatures.\n2. Low Resolution: Media smaller than 512×512 lacks sufficient pixel density for reliable boundary gradient analysis.\n3. Motion Blur: Natural rapid movement blurs edges, mimicking generative smoothing.\n4. Optical Lens Distortions: Wide-angle lenses produce barrel warping that can mimic geometric manipulation.`
    },
    {
      id: 'what-ai-cannot-do',
      title: 'What Automated Detectors CANNOT Determine',
      icon: HelpCircle,
      summary: 'Distinguishing intent, journalistic context, and traditional editing.',
      content: `TruthLens evaluates statistical pixel and frequency anomalies. It cannot determine:\n• Intent: Whether media was created for satire, digital art, or malicious disinformation.\n• Traditional Photo Retouching: Color grading, cropping, or standard Photoshop touchups are not generative deepfakes.\n• Contextual Deception: A real, unedited video distributed with a false date or fabricated caption (cheapfake/shallowfake) appears completely authentic at the pixel level.\n\nIndependent human corroboration, provenance checking, and investigative verification remain indispensable.`
    }
  ];

  const currentTopic = topics.find(t => t.id === selectedTopic) || topics[0];
  const CurrentIcon = currentTopic.icon;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono bg-[#1D2420] text-[#80B9A5] border border-[#303A33] mb-2.5">
          <BookOpen className="w-3.5 h-3.5" />
          <span>FORENSIC EDUCATION HUB</span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#F0F2ED] tracking-tight mb-2.5 font-sans">
          Understand the Forensic Evidence
        </h1>
        <p className="text-xs sm:text-sm text-[#A0AAA1] leading-relaxed max-w-2xl mx-auto">
          Learn how forensic algorithms decompose synthetic imagery, what visual and frequency signals reveal manipulation, and where automated detectors face fundamental boundaries.
        </p>
      </div>

      {/* Two-Column Topic Explorer */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Navigation Sidebar */}
        <div className="md:col-span-5 space-y-2 font-mono text-xs">
          {topics.map((topic) => {
            const Icon = topic.icon;
            const isSelected = selectedTopic === topic.id;
            return (
              <button
                key={topic.id}
                onClick={() => setSelectedTopic(topic.id)}
                className={`w-full text-left p-3.5 rounded border transition-colors flex items-start gap-3 cursor-pointer ${
                  isSelected
                    ? 'bg-[#1D2420] border-[#80B9A5]/60 text-[#F0F2ED]'
                    : 'bg-[#171C19] border-[#303A33] text-[#A0AAA1] hover:bg-[#1D2420] hover:text-[#F0F2ED]'
                }`}
              >
                <div className={`p-1.5 rounded shrink-0 mt-0.5 ${
                  isSelected ? 'bg-[#101311] text-[#80B9A5]' : 'bg-[#101311] text-[#707B72]'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold leading-tight mb-0.5">
                    {topic.title}
                  </h3>
                  <p className="text-[11px] text-[#707B72] line-clamp-1 font-sans">
                    {topic.summary}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Content Viewer */}
        <div className="md:col-span-7">
          <div className="rounded-lg border border-[#303A33] bg-[#171C19] p-6 shadow-xl relative min-h-[440px] flex flex-col justify-between">
            {/* Reticles */}
            <div className="reticle-corner-tl" />
            <div className="reticle-corner-tr" />
            <div className="reticle-corner-bl" />
            <div className="reticle-corner-br" />

            <div>
              {/* Active Topic Header */}
              <div className="flex items-center gap-3 pb-4 border-b border-[#303A33] mb-5">
                <div className="w-10 h-10 rounded-md bg-[#1D2420] border border-[#303A33] flex items-center justify-center text-[#80B9A5]">
                  <CurrentIcon className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#80B9A5] block">
                    FORENSIC TOPIC BRIEF
                  </span>
                  <h2 className="text-lg font-bold text-[#F0F2ED] font-sans">
                    {currentTopic.title}
                  </h2>
                </div>
              </div>

              {/* Topic Content */}
              <div className="space-y-4 text-xs sm:text-sm text-[#A0AAA1] leading-relaxed">
                {currentTopic.content.split('\n\n').map((paragraph, pIdx) => (
                  <p key={pIdx}>{paragraph}</p>
                ))}
              </div>
            </div>

            {/* Bottom Caution Banner */}
            <div className="mt-6 pt-4 border-t border-[#303A33] flex items-center gap-2 text-[11px] font-mono text-[#D9AB68]">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Ground Truth: Automated scores should always be verified alongside provenance context.</span>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
