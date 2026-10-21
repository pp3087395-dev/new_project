import { useState } from 'react';
import type { FC } from 'react';
import { 
  BookOpen, 
  Layers, 
  Eye, 
  Activity, 
  HelpCircle, 
  AlertTriangle, 
  Sparkles, 
  Cpu
} from 'lucide-react';

export const ExplainabilityGuide: FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<string>('frequency-domain');

  const topics = [
    {
      id: 'frequency-domain',
      title: '2D-FFT Fourier & Frequency Domain Anomalies',
      icon: Activity,
      summary: 'Why AI upsamplers leave invisible frequency grid fingerprints.',
      content: `Generative models (GANs, diffusion architectures like Stable Diffusion, Midjourney, and StyleGAN) construct images by successively upsampling latent feature vectors. In early layers, operations like transposed convolutions (deconvolutions) introduce regular mathematical periodicities across pixel grids.\n\nWhile invisible to human eyes in the spatial domain, converting the image to the 2D Fourier (FFT) domain transforms these repeating spatial patterns into prominent high-frequency cross-hatch spikes or circular concentric ripples.\n\nNatural camera optics and lenses do not produce periodic frequency grids; their energy decays smoothly following a natural 1/f power spectrum.`
    },
    {
      id: 'facial-seams',
      title: 'Boundary Blending & Warping Gradients',
      icon: Layers,
      summary: 'Detecting edge discontinuities in face-swap operations.',
      content: `Face-swap tools (DeepFaceLab, SimSwap, RoOP) extract a target face, synthesize a replacement facial pose, and composite it back onto the original frame. To hide edges, tools apply Gaussian feathering or Poisson image blending.\n\nHowever, blending creates a localized drop in spatial sharpness right at the boundary (along the jawline, forehead hairline, and neck). Our inspection looks for a mismatch between the micro-grain noise of the face versus the background camera sensor.`
    },
    {
      id: 'ocular-symmetry',
      title: 'Corneal Specular Reflection Physics',
      icon: Eye,
      summary: 'Testing bilateral lighting angles in eyes.',
      content: `Human eyes are reflective spheres. In real photographs taken under ambient lighting (e.g. sun, studio lamp, window), the specular highlight on the left cornea and right cornea must align in angle, shape, and intensity with 3D scene physics.\n\nGenerative AI synthesizes each facial region statistically rather than solving ray-tracing lighting equations. Consequently, synthetic portraits frequently render inconsistent pupil shapes or highlight reflections pointing toward contradictory light sources.`
    },
    {
      id: 'video-temporal',
      title: 'Video Keyframe & Temporal Flow Jitter',
      icon: Cpu,
      summary: 'Why deepfake video flickers across rapid head movements.',
      content: `Generating a deepfake video requires frame-by-frame synthesis. Even with optical flow regularization, micro-misalignments occur during rapid head rotations, blinks, or occlusion (such as a hand passing in front of the face).\n\nThis introduces high-frequency temporal flickering—a rapid change in pixel values from frame N to N+1 that exceeds normal biological movement speeds.`
    },
    {
      id: 'uncertainty-limits',
      title: 'Why Results May Be Uncertain',
      icon: AlertTriangle,
      summary: 'Understanding compression, low resolution, and lighting noise.',
      content: `Automated detection struggles when:\n1. Social Media Compression: Platforms like WhatsApp and Instagram re-encode images with heavy JPEG compression, wiping out fine Fourier signatures.\n2. Low Resolution: Media smaller than 512x512 lacks sufficient pixel density for boundary gradient analysis.\n3. Motion Blur: Natural rapid movement blurs edges, mimicking generative smoothing.\n4. Camera Lens Distortions: Wide-angle lenses produce optical warping that can resemble geometric manipulation.`
    },
    {
      id: 'what-ai-cannot-do',
      title: 'What Automated Detectors CANNOT Determine',
      icon: HelpCircle,
      summary: 'Distinguishing intent, context, and non-AI modifications.',
      content: `TruthLens is designed to detect statistical pixel and frequency anomalies. It cannot determine:\n• Intent: Whether media was created for satire, art, or malicious disinformation.\n• Traditional Editing: Color grading, cropping, or standard Photoshop touchups are not generative deepfakes.\n• Contextual Deception: A real, unedited video labeled with a false date or misleading caption (cheapfake/shallowfake) will appear authentic at the pixel level.\n\nHuman journalism and provenance verification remain indispensable.`
    }
  ];

  const currentTopic = topics.find(t => t.id === selectedTopic) || topics[0];
  const CurrentIcon = currentTopic.icon;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-cyan-950/60 text-cyan-300 border border-cyan-800/40 mb-3">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Forensic Education Hub</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight font-heading mb-3">
          Understand the Evidence
        </h1>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          Learn how forensic algorithms dissect synthetic imagery, what visual signals reveal manipulation, and where automated detectors face fundamental limits.
        </p>
      </div>

      {/* Two-Column Explorer */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Navigation Sidebar (4 cols) */}
        <div className="md:col-span-5 space-y-2">
          {topics.map((topic) => {
            const Icon = topic.icon;
            const isSelected = selectedTopic === topic.id;
            return (
              <button
                key={topic.id}
                onClick={() => setSelectedTopic(topic.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-950/40 border-cyan-500/50 shadow-md text-white'
                    : 'bg-slate-900/40 border-slate-800 text-slate-300 hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                  isSelected ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold leading-tight mb-1">
                    {topic.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 line-clamp-1">
                    {topic.summary}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Content Viewer (7 cols) */}
        <div className="md:col-span-7">
          <div className="glass-card rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 shadow-xl relative min-h-[420px] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 pb-4 border-b border-slate-800 mb-6">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <CurrentIcon className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-semibold">
                    Technical Deep Dive
                  </span>
                  <h2 className="text-lg font-bold text-white font-heading">
                    {currentTopic.title}
                  </h2>
                </div>
              </div>

              <div className="prose prose-invert max-w-none text-slate-300 text-xs sm:text-sm leading-relaxed space-y-4 whitespace-pre-line">
                {currentTopic.content}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-mono text-[11px] text-violet-400">
                <Sparkles className="w-3.5 h-3.5" /> Educational Forensic Framework
              </span>
              <span className="text-slate-500 text-[11px]">
                TruthLens Heuristics v0.9
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
