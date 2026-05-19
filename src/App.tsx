import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Bot,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileCheck2,
  FileText,
  Gauge,
  ImagePlus,
  Mail,
  Plus,
  Rocket,
  Send,
  Sparkles,
  Trash2,
  UploadCloud,
  Users,
  Video,
  XCircle,
} from "lucide-react";
import { ChangeEvent, DragEvent, useMemo, useState } from "react";
import vivinhoLogo from "./assets/media/vivinho-logo.png";
import deloreanCar from "./assets/media/delorean-car.png";
import neonClock from "./assets/media/neon-clock.png";
import ponteEstaiada from "./assets/media/ponte-estaiada.png";

type Participant = {
  id: string;
  name: string;
  email: string;
  photo: File | null;
  photoPreview: string;
};

type Evidence = {
  projectVideo: File | null;
  presentation: File | null;
  additionalEvidence: File[];
};

type FormDataState = {
  participants: Participant[];
  projectName: string;
  startDate: string;
  problemSolved: string;
  strategicGoal: string;
  resultsGenerated: string;
  usesTechnology: "yes" | "no" | "";
  technologyDescription: string;
  purplePassion: string;
  expansionPotential: string;
  evidence: Evidence;
  privacyAccepted: boolean;
};

type FilePayload = {
  fileName: string;
  mimeType: string;
  base64: string;
};

const endpoint = import.meta.env.VITE_POWER_AUTOMATE_ENDPOINT as string | undefined;
const maxFileSizeMb = Number(import.meta.env.VITE_MAX_FILE_SIZE_MB ?? 25);
const allowedEmailDomain = (import.meta.env.VITE_ALLOWED_EMAIL_DOMAIN ?? "telefonica.com") as string;

const initialParticipant = (): Participant => ({
  id: crypto.randomUUID(),
  name: "",
  email: "",
  photo: null,
  photoPreview: "",
});

const initialData: FormDataState = {
  participants: [initialParticipant()],
  projectName: "",
  startDate: "",
  problemSolved: "",
  strategicGoal: "",
  resultsGenerated: "",
  usesTechnology: "",
  technologyDescription: "",
  purplePassion: "",
  expansionPotential: "",
  evidence: {
    projectVideo: null,
    presentation: null,
    additionalEvidence: [],
  },
  privacyAccepted: false,
};

const purplePassions = [
  "O tempo do cliente é agora",
  "Gente é a nossa melhor tecnologia",
  "Ser curioso pega bem",
  "Dá para ser mais simples",
  "Resultado é comigo",
];

const steps = [
  { title: "Boas-vindas", icon: Rocket },
  { title: "Participantes", icon: Users },
  { title: "Informacoes do projeto", icon: FileText },
  { title: "Estrategia e resultados", icon: Gauge },
  { title: "Tecnologia, IA e automacao", icon: Bot },
  { title: "Cultura e expansao", icon: Sparkles },
  { title: "Evidencias", icon: UploadCloud },
  { title: "Revisao e envio", icon: FileCheck2 },
  { title: "Confirmacao", icon: CheckCircle2 },
];

function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormDataState>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitState, setSubmitState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [submitMessage, setSubmitMessage] = useState("");

  const progress = useMemo(() => ((currentStep + 1) / steps.length) * 100, [currentStep]);
  const isConfirmation = currentStep === steps.length - 1;

  const updateField = <K extends keyof FormDataState>(key: K, value: FormDataState[K]) => {
    setFormData((current) => ({ ...current, [key]: value }));
  };

  const validateStep = (step = currentStep) => {
    const nextErrors: Record<string, string> = {};

    if (step === 0 && !formData.privacyAccepted) {
      nextErrors.privacyAccepted = "Confirme o aviso de uso dos dados para continuar.";
    }

    if (step === 1) {
      formData.participants.forEach((participant, index) => {
        if (!participant.name.trim()) nextErrors[`participant-${participant.id}-name`] = "Informe o nome.";
        if (!isValidEmail(participant.email)) nextErrors[`participant-${participant.id}-email`] = "Informe um e-mail valido.";
        if (!participant.email.toLowerCase().endsWith(`@${allowedEmailDomain.toLowerCase()}`)) {
          nextErrors[`participant-${participant.id}-email`] = `Use e-mail corporativo @${allowedEmailDomain}.`;
        }
        if (!participant.photo) nextErrors[`participant-${participant.id}-photo`] = `Inclua a foto do participante ${index + 1}.`;
      });
    }

    if (step === 2) {
      requireText(nextErrors, "projectName", formData.projectName);
      requireText(nextErrors, "startDate", formData.startDate);
      requireText(nextErrors, "problemSolved", formData.problemSolved);
    }

    if (step === 3) {
      requireText(nextErrors, "strategicGoal", formData.strategicGoal);
      requireText(nextErrors, "resultsGenerated", formData.resultsGenerated);
    }

    if (step === 4) {
      requireText(nextErrors, "usesTechnology", formData.usesTechnology);
      if (formData.usesTechnology === "yes") requireText(nextErrors, "technologyDescription", formData.technologyDescription);
    }

    if (step === 5) {
      requireText(nextErrors, "purplePassion", formData.purplePassion);
      requireText(nextErrors, "expansionPotential", formData.expansionPotential);
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const goNext = () => {
    if (!validateStep()) return;
    setCurrentStep((step) => Math.min(step + 1, steps.length - 1));
  };

  const goBack = () => {
    setErrors({});
    setCurrentStep((step) => Math.max(step - 1, 0));
  };

  const addParticipant = () => {
    setFormData((current) => ({
      ...current,
      participants: [...current.participants, initialParticipant()],
    }));
  };

  const removeParticipant = (id: string) => {
    setFormData((current) => {
      const participant = current.participants.find((item) => item.id === id);
      if (participant?.photoPreview) URL.revokeObjectURL(participant.photoPreview);

      return {
        ...current,
        participants:
          current.participants.length === 1 ? current.participants : current.participants.filter((item) => item.id !== id),
      };
    });
  };

  const updateParticipant = (id: string, patch: Partial<Participant>) => {
    setFormData((current) => ({
      ...current,
      participants: current.participants.map((participant) =>
        participant.id === id ? { ...participant, ...patch } : participant,
      ),
    }));
  };

  const setParticipantPhoto = (participant: Participant, file: File | null) => {
    if (!file) return;
    const error = validateFile(file, ["image/png", "image/jpeg", "image/webp"]);
    if (error) {
      setErrors((current) => ({ ...current, [`participant-${participant.id}-photo`]: error }));
      return;
    }

    if (participant.photoPreview) URL.revokeObjectURL(participant.photoPreview);
    updateParticipant(participant.id, { photo: file, photoPreview: URL.createObjectURL(file) });
    setErrors((current) => omitKey(current, `participant-${participant.id}-photo`));
  };

  const setEvidenceFile = (key: "projectVideo" | "presentation", file: File | null) => {
    if (!file) return;
    const accept =
      key === "projectVideo"
        ? ["video/mp4", "video/quicktime", "video/x-msvideo"]
        : ["application/vnd.openxmlformats-officedocument.presentationml.presentation", "application/vnd.ms-powerpoint"];
    const error = validateFile(file, accept);
    if (error) {
      setErrors((current) => ({ ...current, [key]: error }));
      return;
    }

    setFormData((current) => ({
      ...current,
      evidence: { ...current.evidence, [key]: file },
    }));
    setErrors((current) => omitKey(current, key));
  };

  const addAdditionalEvidence = (files: FileList | File[]) => {
    const accepted: File[] = [];
    const rejected: string[] = [];
    Array.from(files).forEach((file) => {
      const error = validateFile(file);
      if (error) rejected.push(`${file.name}: ${error}`);
      else accepted.push(file);
    });

    setFormData((current) => ({
      ...current,
      evidence: {
        ...current.evidence,
        additionalEvidence: [...current.evidence.additionalEvidence, ...accepted],
      },
    }));

    if (rejected.length) setErrors((current) => ({ ...current, additionalEvidence: rejected.join(" ") }));
    else setErrors((current) => omitKey(current, "additionalEvidence"));
  };

  const removeAdditionalEvidence = (index: number) => {
    setFormData((current) => ({
      ...current,
      evidence: {
        ...current.evidence,
        additionalEvidence: current.evidence.additionalEvidence.filter((_, itemIndex) => itemIndex !== index),
      },
    }));
  };

  const submitForm = async () => {
    for (let step = 0; step < steps.length - 1; step += 1) {
      if (!validateStep(step)) {
        setCurrentStep(step);
        return;
      }
    }

    if (!endpoint) {
      setSubmitState("error");
      setSubmitMessage("Configure VITE_POWER_AUTOMATE_ENDPOINT no ambiente antes de enviar inscricoes reais.");
      return;
    }

    setSubmitState("sending");
    setSubmitMessage("");

    try {
      const payload = await buildPayload(formData);
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Falha no envio");

      setSubmitState("success");
      setSubmitMessage("Inscricao recebida com sucesso.");
      setCurrentStep(steps.length - 1);
    } catch {
      setSubmitState("error");
      setSubmitMessage("Nao foi possivel enviar agora. Tente novamente ou acione a equipe organizadora.");
    }
  };

  return (
    <main className="min-h-screen overflow-hidden bg-vivo-black text-white">
      <BackgroundScene />

      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-center justify-between gap-4 pb-5">
          <div className="flex items-center gap-3">
            <img className="h-14 w-12 object-contain drop-shadow-[0_0_18px_rgba(155,45,255,0.75)]" src={vivinhoLogo} alt="Vivinho neon" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-vivo-lilac">VIVO</p>
              <h1 className="text-lg font-semibold sm:text-2xl">Inscricao de Projetos</h1>
            </div>
          </div>
          <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-vivo-text">
            De Volta Para o Futuro
          </div>
        </header>

        <div className="grid flex-1 gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="relative hidden overflow-hidden rounded-lg border border-white/10 bg-white/[0.04] p-5 shadow-panel backdrop-blur-xl lg:block">
            <div className="absolute inset-x-0 top-24 h-1 bg-gradient-to-r from-transparent via-vivo-neon to-transparent opacity-80" />
            <div className="relative">
              <p className="text-sm uppercase tracking-[0.24em] text-vivo-lilac">Portal temporal</p>
              <h2 className="mt-3 text-4xl font-black leading-tight">CONSTRUIR HOJE EVOLUIR SEMPRE</h2>
            </div>

            <div className="relative mt-10 h-64">
              <div className="time-ring" />
              <img className="car-pulse absolute bottom-0 left-1/2 w-[125%] max-w-none -translate-x-1/2 drop-shadow-[0_0_34px_rgba(155,45,255,0.75)]" src={deloreanCar} alt="Carro futurista com fundo transparente" />
            </div>

            <div className="mt-8 space-y-3">
              {steps.slice(0, -1).map((step, index) => {
                const Icon = step.icon;
                const isActive = index === currentStep;
                const isDone = index < currentStep;
                return (
                  <div key={step.title} className={`step-pill ${isActive ? "active" : ""} ${isDone ? "done" : ""}`}>
                    <Icon size={17} />
                    <span>{step.title}</span>
                  </div>
                );
              })}
            </div>
          </aside>

          <section className="flex min-w-0 flex-col">
            <ProgressBar progress={progress} currentStep={currentStep} />

            <div className="relative mt-4 flex-1 overflow-hidden rounded-lg border border-white/10 bg-[#090512]/85 shadow-panel backdrop-blur-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(102,0,204,0.26),transparent_36%)]" />
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -18 }}
                  transition={{ duration: 0.28, ease: "easeOut" }}
                  className="relative p-5 sm:p-8"
                >
                  {currentStep === 0 && <WelcomeStep data={formData} errors={errors} updateField={updateField} />}
                  {currentStep === 1 && (
                    <ParticipantsStep
                      participants={formData.participants}
                      errors={errors}
                      addParticipant={addParticipant}
                      removeParticipant={removeParticipant}
                      updateParticipant={updateParticipant}
                      setParticipantPhoto={setParticipantPhoto}
                    />
                  )}
                  {currentStep === 2 && <ProjectStep data={formData} errors={errors} updateField={updateField} />}
                  {currentStep === 3 && <StrategyStep data={formData} errors={errors} updateField={updateField} />}
                  {currentStep === 4 && <TechnologyStep data={formData} errors={errors} updateField={updateField} />}
                  {currentStep === 5 && <CultureStep data={formData} errors={errors} updateField={updateField} />}
                  {currentStep === 6 && (
                    <EvidenceStep
                      evidence={formData.evidence}
                      errors={errors}
                      setEvidenceFile={setEvidenceFile}
                      addAdditionalEvidence={addAdditionalEvidence}
                      removeAdditionalEvidence={removeAdditionalEvidence}
                    />
                  )}
                  {currentStep === 7 && <ReviewStep data={formData} submitState={submitState} submitMessage={submitMessage} />}
                  {currentStep === 8 && <ConfirmationStep submitState={submitState} submitMessage={submitMessage} />}
                </motion.div>
              </AnimatePresence>
            </div>

            {!isConfirmation && (
              <nav className="mt-4 flex items-center justify-between gap-3">
                <button className="btn-secondary" type="button" onClick={goBack} disabled={currentStep === 0}>
                  <ChevronLeft size={18} />
                  Voltar
                </button>

                {currentStep < steps.length - 2 ? (
                  <button className="btn-primary" type="button" onClick={goNext}>
                    Avancar
                    <ChevronRight size={18} />
                  </button>
                ) : (
                  <button className="btn-primary" type="button" onClick={submitForm} disabled={submitState === "sending"}>
                    {submitState === "sending" ? "Enviando..." : "Enviar inscricao"}
                    <Send size={18} />
                  </button>
                )}
              </nav>
            )}

            <footer className="py-4 text-center text-xs text-white/45">
              Projeto desenvolvido por Gabriela Paula da Silva
            </footer>
          </section>
        </div>
      </section>
    </main>
  );
}

function BackgroundScene() {
  return (
    <div className="pointer-events-none fixed inset-0">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(155,45,255,0.28),transparent_30%),radial-gradient(circle_at_82%_18%,rgba(40,210,255,0.12),transparent_24%),linear-gradient(180deg,#030008,#0b0614_54%,#030008)]" />
      <div className="grid-bg absolute inset-0 opacity-45" />
      <div className="scanline absolute inset-0 opacity-25" />
      <div className="particle particle-a" />
      <div className="particle particle-b" />
      <div className="particle particle-c" />
    </div>
  );
}

function ProgressBar({ progress, currentStep }: { progress: number; currentStep: number }) {
  const Icon = steps[currentStep].icon;
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-vivo-neon/50 bg-vivo-purple/25 text-vivo-lilac shadow-neon">
            <Icon size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.2em] text-vivo-text">Etapa {currentStep + 1} de {steps.length}</p>
            <h2 className="truncate text-base font-semibold sm:text-xl">{steps[currentStep].title}</h2>
          </div>
        </div>
        <span className="text-sm font-semibold text-vivo-lilac">{Math.round(progress)}%</span>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
        <motion.div className="h-full rounded-full bg-gradient-to-r from-vivo-purple via-vivo-neon to-vivo-lilac" animate={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

function WelcomeStep({
  data,
  errors,
  updateField,
}: {
  data: FormDataState;
  errors: Record<string, string>;
  updateField: <K extends keyof FormDataState>(key: K, value: FormDataState[K]) => void;
}) {
  return (
    <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
      <div>
        <p className="eyebrow">VIVO | De Volta Para o Futuro</p>
        <h2 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">Inscreva o projeto que move a operacao para o futuro.</h2>
        <p className="mt-5 max-w-2xl text-base leading-7 text-vivo-text">
          O formulario coleta participantes, resultados, tecnologia aplicada e evidencias em uma jornada simples, visual e objetiva.
        </p>
        <label className="mt-7 flex cursor-pointer items-start gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-4 text-sm text-vivo-text">
          <input
            className="mt-1 h-4 w-4 accent-vivo-neon"
            type="checkbox"
            checked={data.privacyAccepted}
            onChange={(event) => updateField("privacyAccepted", event.target.checked)}
          />
          <span>
            Estou ciente de que os dados informados serao usados apenas para inscricao, avaliacao e organizacao dos projetos
            internos.
          </span>
        </label>
        <FieldError message={errors.privacyAccepted} />
      </div>
      <div className="relative min-h-72 overflow-hidden rounded-lg border border-vivo-neon/30 bg-black/20">
        <div className="absolute inset-x-0 bottom-16 h-1 bg-gradient-to-r from-transparent via-vivo-neon to-transparent shadow-neon" />
        <div className="time-ring small" />
        <img className="absolute bottom-0 left-1/2 w-[74%] max-w-none -translate-x-1/2 clock-float drop-shadow-[0_0_34px_rgba(155,45,255,0.82)]" src={neonClock} alt="" />
        <img className="absolute right-4 top-4 h-28 object-contain drop-shadow-[0_0_24px_rgba(192,132,252,0.9)]" src={vivinhoLogo} alt="" />
      </div>
    </div>
  );
}

function ParticipantsStep({
  participants,
  errors,
  addParticipant,
  removeParticipant,
  updateParticipant,
  setParticipantPhoto,
}: {
  participants: Participant[];
  errors: Record<string, string>;
  addParticipant: () => void;
  removeParticipant: (id: string) => void;
  updateParticipant: (id: string, patch: Partial<Participant>) => void;
  setParticipantPhoto: (participant: Participant, file: File | null) => void;
}) {
  return (
    <div>
      <StepHeading title="Participantes do projeto" description="Adicione todos os integrantes e uma foto individual para cada pessoa." />
      <div className="mt-6 space-y-4">
        {participants.map((participant, index) => (
          <div key={participant.id} className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="font-semibold text-white">Participante {index + 1}</h3>
              <button className="icon-button" type="button" onClick={() => removeParticipant(participant.id)} aria-label="Remover participante">
                <Trash2 size={17} />
              </button>
            </div>
            <div className="grid gap-4 md:grid-cols-[1fr_1fr_190px]">
              <TextField
                label="Nome completo"
                value={participant.name}
                onChange={(value) => updateParticipant(participant.id, { name: value })}
                error={errors[`participant-${participant.id}-name`]}
              />
              <TextField
                label="E-mail corporativo"
                type="email"
                icon={<Mail size={16} />}
                value={participant.email}
                onChange={(value) => updateParticipant(participant.id, { email: value })}
                error={errors[`participant-${participant.id}-email`]}
              />
              <FileDropzone
                compact
                label="Foto"
                accept="image/png,image/jpeg,image/webp"
                icon={<ImagePlus size={18} />}
                fileName={participant.photo?.name}
                preview={participant.photoPreview}
                error={errors[`participant-${participant.id}-photo`]}
                onFiles={(files) => setParticipantPhoto(participant, files[0] ?? null)}
              />
            </div>
          </div>
        ))}
      </div>
      <button className="btn-secondary mt-5" type="button" onClick={addParticipant}>
        <Plus size={18} />
        Adicionar participante
      </button>
    </div>
  );
}

function ProjectStep(props: StepProps) {
  const { data, errors, updateField } = props;
  return (
    <div>
      <StepHeading title="Informacoes do projeto" description="Conte o nome, o inicio e o problema que a iniciativa resolve." />
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <TextField label="Nome do projeto" value={data.projectName} onChange={(value) => updateField("projectName", value)} error={errors.projectName} />
        <TextField label="Data de inicio" type="month" icon={<CalendarDays size={16} />} value={data.startDate} onChange={(value) => updateField("startDate", value)} error={errors.startDate} />
        <TextArea className="md:col-span-2" label="Qual problema o projeto resolve?" value={data.problemSolved} onChange={(value) => updateField("problemSolved", value)} error={errors.problemSolved} />
      </div>
    </div>
  );
}

function StrategyStep(props: StepProps) {
  const { data, errors, updateField } = props;
  return (
    <div>
      <StepHeading title="Estrategia e resultados" description="Conecte o projeto a uma meta da VP e descreva os impactos obtidos." />
      <div className="mt-6 grid gap-4">
        <TextArea label="Qual meta estrategica da VP este projeto apoia?" value={data.strategicGoal} onChange={(value) => updateField("strategicGoal", value)} error={errors.strategicGoal} />
        <TextArea label="Quais resultados o projeto gerou?" value={data.resultsGenerated} onChange={(value) => updateField("resultsGenerated", value)} error={errors.resultsGenerated} />
      </div>
    </div>
  );
}

function TechnologyStep(props: StepProps) {
  const { data, errors, updateField } = props;
  return (
    <div>
      <StepHeading title="Tecnologia, IA e automacao" description="Informe se ha uso de automacao, inteligencia artificial ou outra tecnologia." />
      <div className="mt-6 space-y-5">
        <div>
          <span className="field-label">O projeto utiliza automacao, IA ou alguma tecnologia?</span>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            {[
              ["yes", "Sim, utiliza tecnologia"],
              ["no", "Nao utiliza"],
            ].map(([value, label]) => (
              <button
                key={value}
                className={`choice-button ${data.usesTechnology === value ? "selected" : ""}`}
                type="button"
                onClick={() => updateField("usesTechnology", value as FormDataState["usesTechnology"])}
              >
                {label}
              </button>
            ))}
          </div>
          <FieldError message={errors.usesTechnology} />
        </div>

        {data.usesTechnology === "yes" && (
          <TextArea
            label="Como a tecnologia e aplicada?"
            value={data.technologyDescription}
            onChange={(value) => updateField("technologyDescription", value)}
            error={errors.technologyDescription}
          />
        )}
      </div>
    </div>
  );
}

function CultureStep(props: StepProps) {
  const { data, errors, updateField } = props;
  return (
    <div className="relative overflow-hidden">
      <img className="pointer-events-none absolute -right-20 bottom-0 hidden w-[54%] max-w-xl opacity-20 bridge-glow md:block" src={ponteEstaiada} alt="" />
      <div className="relative">
      <StepHeading title="Cultura e expansao" description="Escolha a Paixao Purpura mais aderente e conte se o projeto pode escalar." />
      <div className="mt-6 grid gap-4">
        <label className="block">
          <span className="field-label">Paixao Purpura</span>
          <select className="field-input" value={data.purplePassion} onChange={(event) => updateField("purplePassion", event.target.value)}>
            <option value="">Selecione uma opcao</option>
            {purplePassions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <FieldError message={errors.purplePassion} />
        </label>
        <TextArea label="O projeto possui potencial de expansao?" value={data.expansionPotential} onChange={(value) => updateField("expansionPotential", value)} error={errors.expansionPotential} />
      </div>
      </div>
    </div>
  );
}

function EvidenceStep({
  evidence,
  errors,
  setEvidenceFile,
  addAdditionalEvidence,
  removeAdditionalEvidence,
}: {
  evidence: Evidence;
  errors: Record<string, string>;
  setEvidenceFile: (key: "projectVideo" | "presentation", file: File | null) => void;
  addAdditionalEvidence: (files: FileList | File[]) => void;
  removeAdditionalEvidence: (index: number) => void;
}) {
  return (
    <div>
      <StepHeading title="Evidencias e resultados" description={`Anexe video, PowerPoint e materiais complementares. Limite por arquivo: ${maxFileSizeMb} MB.`} />
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <FileDropzone
          label="Video do projeto"
          accept="video/mp4,video/quicktime,video/x-msvideo"
          icon={<Video size={20} />}
          fileName={evidence.projectVideo?.name}
          error={errors.projectVideo}
          onFiles={(files) => setEvidenceFile("projectVideo", files[0] ?? null)}
        />
        <FileDropzone
          label="Apresentacao PowerPoint"
          accept=".ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
          icon={<FileText size={20} />}
          fileName={evidence.presentation?.name}
          error={errors.presentation}
          onFiles={(files) => setEvidenceFile("presentation", files[0] ?? null)}
        />
        <div className="md:col-span-2">
          <FileDropzone
            multiple
            label="Outras evidencias/resultados"
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,video/*"
            icon={<UploadCloud size={20} />}
            fileName={evidence.additionalEvidence.length ? `${evidence.additionalEvidence.length} arquivo(s) selecionado(s)` : undefined}
            error={errors.additionalEvidence}
            onFiles={addAdditionalEvidence}
          />
          {evidence.additionalEvidence.length > 0 && (
            <div className="mt-3 grid gap-2">
              {evidence.additionalEvidence.map((file, index) => (
                <div key={`${file.name}-${index}`} className="flex items-center justify-between gap-3 rounded-md border border-white/10 bg-white/[0.035] px-3 py-2 text-sm text-vivo-text">
                  <span className="truncate">{file.name}</span>
                  <button className="icon-button" type="button" onClick={() => removeAdditionalEvidence(index)} aria-label="Remover evidencia">
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ReviewStep({ data, submitState, submitMessage }: { data: FormDataState; submitState: string; submitMessage: string }) {
  return (
    <div>
      <StepHeading title="Revisao antes do envio" description="Confira os principais dados antes de enviar para o fluxo Power Automate." />
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <ReviewCard title="Projeto" items={[["Nome", data.projectName], ["Inicio", data.startDate], ["Problema", data.problemSolved]]} />
        <ReviewCard title="Participantes" items={data.participants.map((participant) => [participant.name, participant.email])} />
        <ReviewCard title="Estrategia" items={[["Meta da VP", data.strategicGoal], ["Resultados", data.resultsGenerated]]} />
        <ReviewCard
          title="Tecnologia e cultura"
          items={[
            ["Usa tecnologia", data.usesTechnology === "yes" ? "Sim" : "Nao"],
            ["Descricao", data.technologyDescription || "Nao aplicavel"],
            ["Paixao Purpura", data.purplePassion],
            ["Expansao", data.expansionPotential],
          ]}
        />
        <ReviewCard
          title="Evidencias"
          items={[
            ["Video", data.evidence.projectVideo?.name || "Nao anexado"],
            ["PowerPoint", data.evidence.presentation?.name || "Nao anexado"],
            ["Complementares", `${data.evidence.additionalEvidence.length} arquivo(s)`],
          ]}
        />
      </div>
      {submitState === "error" && <StatusMessage type="error" message={submitMessage} />}
    </div>
  );
}

function ConfirmationStep({ submitState, submitMessage }: { submitState: string; submitMessage: string }) {
  const isSuccess = submitState === "success";
  return (
    <div className="grid min-h-[460px] place-items-center text-center">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-xl">
        <div className={`mx-auto grid h-24 w-24 place-items-center rounded-full border ${isSuccess ? "border-emerald-300/60 bg-emerald-400/10 text-emerald-200" : "border-vivo-neon/50 bg-vivo-purple/20 text-vivo-lilac"} shadow-neon`}>
          {isSuccess ? <CheckCircle2 size={48} /> : <Rocket size={48} />}
        </div>
        <h2 className="mt-7 text-4xl font-black">{isSuccess ? "Inscricao enviada!" : "Portal pronto."}</h2>
        <p className="mt-4 text-vivo-text">{submitMessage || "Quando o endpoint estiver configurado, o envio seguira para o Power Automate."}</p>
      </motion.div>
    </div>
  );
}

function StepHeading({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <p className="eyebrow">Formulario VIVO</p>
      <h2 className="mt-2 text-3xl font-black leading-tight sm:text-4xl">{title}</h2>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-vivo-text sm:text-base">{description}</p>
    </div>
  );
}

type StepProps = {
  data: FormDataState;
  errors: Record<string, string>;
  updateField: <K extends keyof FormDataState>(key: K, value: FormDataState[K]) => void;
};

function TextField({
  label,
  value,
  onChange,
  error,
  type = "text",
  icon,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
  icon?: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      <span className="relative block">
        {icon && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-vivo-lilac">{icon}</span>}
        <input className={`field-input ${icon ? "pl-10" : ""}`} type={type} value={value} onChange={(event) => onChange(event.target.value)} />
      </span>
      <FieldError message={error} />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  error,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="field-label">{label}</span>
      <textarea className="field-input min-h-32 resize-y" value={value} onChange={(event) => onChange(event.target.value)} />
      <FieldError message={error} />
    </label>
  );
}

function FileDropzone({
  label,
  accept,
  icon,
  fileName,
  preview,
  error,
  compact = false,
  multiple = false,
  onFiles,
}: {
  label: string;
  accept: string;
  icon: React.ReactNode;
  fileName?: string;
  preview?: string;
  error?: string;
  compact?: boolean;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
}) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) onFiles(Array.from(event.target.files));
    event.target.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    onFiles(Array.from(event.dataTransfer.files));
  };

  return (
    <label className="block">
      <span className="field-label">{label}</span>
      <span
        className={`dropzone ${compact ? "min-h-[118px]" : "min-h-[170px]"}`}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
      >
        <input className="sr-only" type="file" accept={accept} multiple={multiple} onChange={handleChange} />
        {preview ? (
          <img className="h-20 w-20 rounded-md object-cover ring-1 ring-vivo-neon/40" src={preview} alt={`Preview de ${label}`} />
        ) : (
          <span className="grid h-12 w-12 place-items-center rounded-md border border-vivo-neon/40 bg-vivo-purple/20 text-vivo-lilac">
            {icon}
          </span>
        )}
        <span className="mt-3 block max-w-full truncate text-sm font-semibold text-white">{fileName || "Arraste ou selecione arquivo"}</span>
        <span className="mt-1 block text-xs text-vivo-text">Clique para procurar</span>
      </span>
      <FieldError message={error} />
    </label>
  );
}

function ReviewCard({ title, items }: { title: string; items: string[][] }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
      <h3 className="font-semibold text-vivo-lilac">{title}</h3>
      <dl className="mt-3 space-y-3">
        {items.map(([label, value]) => (
          <div key={`${label}-${value}`}>
            <dt className="text-xs uppercase tracking-[0.16em] text-white/45">{label}</dt>
            <dd className="mt-1 break-words text-sm leading-6 text-vivo-text">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-2 flex items-center gap-2 text-sm text-rose-200">
      <AlertTriangle size={15} />
      {message}
    </p>
  );
}

function StatusMessage({ type, message }: { type: "error" | "success"; message: string }) {
  return (
    <div className={`mt-5 flex items-center gap-3 rounded-lg border p-4 ${type === "error" ? "border-rose-300/30 bg-rose-500/10 text-rose-100" : "border-emerald-300/30 bg-emerald-500/10 text-emerald-100"}`}>
      {type === "error" ? <XCircle size={20} /> : <CheckCircle2 size={20} />}
      <span>{message}</span>
    </div>
  );
}

function requireText(errors: Record<string, string>, key: string, value: string) {
  if (!value.trim()) errors[key] = "Campo obrigatorio.";
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function validateFile(file: File, accept?: string[]) {
  if (file.size > maxFileSizeMb * 1024 * 1024) return `Arquivo acima de ${maxFileSizeMb} MB.`;
  if (accept && !accept.includes(file.type)) return "Formato de arquivo nao permitido.";
  return "";
}

function omitKey<T extends Record<string, string>>(record: T, key: string) {
  const next = { ...record };
  delete next[key];
  return next;
}

function toBase64(file: File): Promise<FilePayload> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? "");
      resolve({
        fileName: file.name,
        mimeType: file.type || "application/octet-stream",
        base64: result.includes(",") ? result.split(",")[1] : result,
      });
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function optionalFile(file: File | null) {
  return file ? toBase64(file) : null;
}

async function buildPayload(data: FormDataState) {
  return {
    submittedAt: new Date().toISOString(),
    source: "vivo-back-to-future-form",
    participants: await Promise.all(
      data.participants.map(async (participant) => ({
        name: participant.name.trim(),
        email: participant.email.trim(),
        photo: participant.photo ? await toBase64(participant.photo) : null,
      })),
    ),
    project: {
      projectName: data.projectName.trim(),
      startDate: data.startDate,
      problemSolved: data.problemSolved.trim(),
      strategicGoal: data.strategicGoal.trim(),
      resultsGenerated: data.resultsGenerated.trim(),
      usesTechnology: data.usesTechnology === "yes",
      technologyDescription: data.technologyDescription.trim(),
      purplePassion: data.purplePassion,
      expansionPotential: data.expansionPotential.trim(),
    },
    evidence: {
      projectVideo: await optionalFile(data.evidence.projectVideo),
      presentation: await optionalFile(data.evidence.presentation),
      additionalEvidence: await Promise.all(data.evidence.additionalEvidence.map(toBase64)),
    },
  };
}

export default App;
