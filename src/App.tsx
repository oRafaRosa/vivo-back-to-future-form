import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Download,
  FileCheck2,
  FileText,
  Gauge,
  Link as LinkIcon,
  Mail,
  Plus,
  Rocket,
  Send,
  Sparkles,
  Trash2,
  UploadCloud,
  Users,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import writeXlsxFile from "write-excel-file/browser";
import vivinhoLogo from "./assets/media/vivinho-logo.png";
import deloreanCar from "./assets/media/delorean-car.png";
import neonClock from "./assets/media/neon-clock.png";
import ponteEstaiada from "./assets/media/ponte-estaiada.png";

type CoParticipant = {
  id: string;
  name: string;
  email: string;
};

type Evidence = {
  oneDriveFolderLink: string;
};

type FormDataState = {
  projectName: string;
  responsibleArea: string;
  projectLeader: string;
  leaderEmail: string;
  coParticipants: CoParticipant[];
  hasFinancialGain: "yes" | "no" | "";
  financialGainDescription: string;
  projectObjective: string;
  projectDescription: string;
  strategicImpacts: string[];
  currentSituation: string;
  futureSituation: string;
  projectBenefits: string;
  impactedProducts: string[];
  assumptions: string;
  expectedResults: string;
  evidence: Evidence;
  privacyAccepted: boolean;
};

const endpoint = import.meta.env.VITE_POWER_AUTOMATE_ENDPOINT as string | undefined;
const allowedEmailDomain = (import.meta.env.VITE_ALLOWED_EMAIL_DOMAIN ?? "telefonica.com") as string;
const draftStorageKey = "vivo-back-to-future-form-draft-v2";
const submissionEnabled = false;

const responsibleAreas = [
  "Gerência de Serviços ao Cliente Centralizado",
  "Qualidade",
  "Produção",
  "Projetos e TI",
  "Processos",
];

const strategicImpactOptions = [
  "Produtividade",
  "Qualidade",
  "Eficiência",
  "Processos",
  "Experiência do Cliente",
  "IA",
  "Automação",
];

const impactedProductOptions = [
  "Cobre",
  "Fibra",
  "Móvel",
  "Voz – TDM (v5)",
  "Voz – TDM (h248)",
  "Voz – IMS (V5.2)",
  "Voz – IMS (H248)",
  "Voz – IMS",
  "Voip/SIP",
  "Projetos especiais",
  "Banda Larga Fibra",
  "Banda Larga Cobre",
  "B2B Dados Avançado",
  "Pré-Pago",
  "Pós-pago",
  "Controle",
  "Híbrida",
  "DTH",
  "IPTV",
  "B2C",
  "B2B",
  "Atacado",
];

const initialCoParticipant = (): CoParticipant => ({
  id: crypto.randomUUID(),
  name: "",
  email: "",
});

const initialData: FormDataState = {
  projectName: "",
  responsibleArea: "",
  projectLeader: "",
  leaderEmail: "",
  coParticipants: [],
  hasFinancialGain: "",
  financialGainDescription: "",
  projectObjective: "",
  projectDescription: "",
  strategicImpacts: [],
  currentSituation: "",
  futureSituation: "",
  projectBenefits: "",
  impactedProducts: [],
  assumptions: "",
  expectedResults: "",
  evidence: {
    oneDriveFolderLink: "",
  },
  privacyAccepted: false,
};

const steps = [
  { title: "Boas-vindas", icon: Rocket },
  { title: "Identificação", icon: Users },
  { title: "Projeto", icon: FileText },
  { title: "Impacto estratégico", icon: Gauge },
  { title: "Cenário e resultados", icon: Bot },
  { title: "Evidências", icon: UploadCloud },
  { title: "Revisão e envio", icon: FileCheck2 },
  { title: "Confirmação", icon: CheckCircle2 },
];

function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormDataState>(() => loadSavedDraft());
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
      requireText(nextErrors, "projectName", formData.projectName, 80);
      requireText(nextErrors, "responsibleArea", formData.responsibleArea);
      requireText(nextErrors, "projectLeader", formData.projectLeader, 60);
      if (!isValidEmail(formData.leaderEmail)) nextErrors.leaderEmail = "Informe um e-mail válido.";
      if (formData.leaderEmail && !formData.leaderEmail.toLowerCase().endsWith(`@${allowedEmailDomain.toLowerCase()}`)) {
        nextErrors.leaderEmail = `Use e-mail corporativo @${allowedEmailDomain}.`;
      }
      formData.coParticipants.forEach((participant) => {
        requireText(nextErrors, `coParticipant-${participant.id}-name`, participant.name, 60);
        if (participant.email && !isValidEmail(participant.email)) {
          nextErrors[`coParticipant-${participant.id}-email`] = "Informe um e-mail válido.";
        }
      });
    }

    if (step === 2) {
      requireText(nextErrors, "hasFinancialGain", formData.hasFinancialGain);
      if (formData.hasFinancialGain === "yes") {
        requireText(nextErrors, "financialGainDescription", formData.financialGainDescription, 300);
      }
      requireText(nextErrors, "projectObjective", formData.projectObjective, 500);
      requireText(nextErrors, "projectDescription", formData.projectDescription, 2000);
    }

    if (step === 3) {
      if (formData.strategicImpacts.length === 0) nextErrors.strategicImpacts = "Selecione pelo menos um impacto estratégico.";
      requireText(nextErrors, "currentSituation", formData.currentSituation, 700);
      requireText(nextErrors, "futureSituation", formData.futureSituation, 700);
    }

    if (step === 4) {
      requireText(nextErrors, "projectBenefits", formData.projectBenefits, 700);
      if (formData.impactedProducts.length === 0) nextErrors.impactedProducts = "Selecione pelo menos um produto impactado.";
      requireText(nextErrors, "expectedResults", formData.expectedResults, 700);
      if (formData.assumptions.length > 500) nextErrors.assumptions = "Use no máximo 500 caracteres.";
    }

    if (step === 5) {
      requireText(nextErrors, "oneDriveFolderLink", formData.evidence.oneDriveFolderLink);
      if (formData.evidence.oneDriveFolderLink && !isValidUrl(formData.evidence.oneDriveFolderLink)) {
        nextErrors.oneDriveFolderLink = "Informe um link válido da pasta compartilhada no OneDrive.";
      }
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

  const addCoParticipant = () => {
    setFormData((current) => ({
      ...current,
      coParticipants: [...current.coParticipants, initialCoParticipant()],
    }));
  };

  const removeCoParticipant = (id: string) => {
    setFormData((current) => ({
      ...current,
      coParticipants: current.coParticipants.filter((participant) => participant.id !== id),
    }));
  };

  const updateCoParticipant = (id: string, patch: Partial<CoParticipant>) => {
    setFormData((current) => ({
      ...current,
      coParticipants: current.coParticipants.map((participant) =>
        participant.id === id ? { ...participant, ...patch } : participant,
      ),
    }));
  };

  const toggleListValue = <K extends "strategicImpacts" | "impactedProducts">(key: K, value: string) => {
    setFormData((current) => {
      const items = current[key];
      return {
        ...current,
        [key]: items.includes(value) ? items.filter((item) => item !== value) : [...items, value],
      };
    });
    setErrors((current) => omitKey(current, key));
  };

  const updateEvidenceLink = (value: string) => {
    setFormData((current) => ({
      ...current,
      evidence: { oneDriveFolderLink: value },
    }));
    setErrors((current) => omitKey(current, "oneDriveFolderLink"));
  };

  const downloadResponsesXlsx = async () => {
    await exportResponsesXlsx(formData);
  };

  const submitForm = async () => {
    if (!submissionEnabled) return;

    for (let step = 0; step < steps.length - 1; step += 1) {
      if (!validateStep(step)) {
        setCurrentStep(step);
        return;
      }
    }

    if (!endpoint) {
      setSubmitState("error");
      setSubmitMessage("Configure VITE_POWER_AUTOMATE_ENDPOINT no ambiente antes de enviar inscrições reais.");
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
      setSubmitMessage("Inscrição recebida com sucesso.");
      setCurrentStep(steps.length - 1);
    } catch {
      setSubmitState("error");
      setSubmitMessage("Não foi possível enviar agora. Tente novamente ou acione a equipe organizadora.");
    }
  };

  useEffect(() => {
    window.localStorage.setItem(draftStorageKey, JSON.stringify(formData));
  }, [formData]);

  return (
    <main className="min-h-screen overflow-hidden bg-vivo-black text-white">
      <BackgroundScene />
      <VivinhoProgress progress={progress} />

      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-center justify-between gap-4 pb-5">
          <div className="flex items-center gap-3">
            <img className="logo-hover h-14 w-12 object-contain drop-shadow-[0_0_18px_rgba(155,45,255,0.75)]" src={vivinhoLogo} alt="Vivinho neon" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-vivo-lilac">VIVO</p>
              <h1 className="text-lg font-semibold sm:text-2xl">Inscrição de Projetos</h1>
            </div>
          </div>
          <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-vivo-text">
            Back to the Future | Reunião de Resultados
          </div>
        </header>

        <div className="grid flex-1 gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="interactive-panel relative hidden overflow-hidden rounded-lg border border-white/10 bg-white/[0.04] p-5 shadow-panel backdrop-blur-xl lg:block">
            <div className="absolute inset-x-0 top-24 h-1 bg-gradient-to-r from-transparent via-vivo-neon to-transparent opacity-80" />
            <div className="relative">
              <p className="text-sm uppercase tracking-[0.24em] text-vivo-lilac">Vitrine executiva</p>
              <h2 className="mt-3 text-4xl font-black leading-tight">PROJETOS QUE ACELERAM O FUTURO</h2>
            </div>

            <div className="side-visual relative mt-10 h-64">
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
                    <IdentificationStep
                      data={formData}
                      errors={errors}
                      updateField={updateField}
                      addCoParticipant={addCoParticipant}
                      removeCoParticipant={removeCoParticipant}
                      updateCoParticipant={updateCoParticipant}
                    />
                  )}
                  {currentStep === 2 && <ProjectStep data={formData} errors={errors} updateField={updateField} />}
                  {currentStep === 3 && <StrategicImpactStep data={formData} errors={errors} updateField={updateField} toggleListValue={toggleListValue} />}
                  {currentStep === 4 && <ResultsStep data={formData} errors={errors} updateField={updateField} toggleListValue={toggleListValue} />}
                  {currentStep === 5 && (
                    <EvidenceStep
                      evidence={formData.evidence}
                      errors={errors}
                      updateEvidenceLink={updateEvidenceLink}
                    />
                  )}
                  {currentStep === 6 && (
                    <ReviewStep
                      data={formData}
                      submitState={submitState}
                      submitMessage={submitMessage}
                      onDownloadXlsx={downloadResponsesXlsx}
                    />
                  )}
                  {currentStep === 7 && (
                    <ConfirmationStep
                      submitState={submitState}
                      submitMessage={submitMessage}
                      onDownloadXlsx={downloadResponsesXlsx}
                    />
                  )}
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
                    Avançar
                    <ChevronRight size={18} />
                  </button>
                ) : (
                  <button className="btn-primary" type="button" onClick={submitForm} disabled={!submissionEnabled || submitState === "sending"}>
                    {submitState === "sending" ? "Enviando..." : "Envio desabilitado"}
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

function VivinhoProgress({ progress }: { progress: number }) {
  return (
    <div className="vivinho-progress" aria-hidden="true">
      <div className="vivinho-progress-orbit" />
      <img className="vivinho-progress-outline" src={vivinhoLogo} alt="" />
      <div className="vivinho-progress-fill" style={{ height: `${progress}%` }}>
        <img src={vivinhoLogo} alt="" />
      </div>
      <span className="vivinho-progress-label">{Math.round(progress)}%</span>
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
        <p className="eyebrow">VIVO | Back to the Future</p>
        <h2 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">Inscreva o projeto que acelera os resultados da operação.</h2>
        <p className="mt-5 max-w-2xl text-vivo-text">
          Preencha respostas objetivas, estratégicas e mensuráveis. Campos não aplicáveis podem ser preenchidos com N/A.
        </p>
        <label className="consent-card mt-7 flex cursor-pointer items-start gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-4 text-sm text-vivo-text">
          <input
            className="mt-1 h-4 w-4 accent-vivo-neon"
            type="checkbox"
            checked={data.privacyAccepted}
            onChange={(event) => updateField("privacyAccepted", event.target.checked)}
          />
          <span>
            Estou ciente de que os dados informados serão usados apenas para inscrição, avaliação executiva e organização dos
            projetos internos.
          </span>
        </label>
        <FieldError message={errors.privacyAccepted} />
      </div>
      <div className="welcome-visual interactive-card relative min-h-72 overflow-hidden rounded-lg border border-vivo-neon/30 bg-black/20">
        <div className="absolute inset-x-0 bottom-16 h-1 bg-gradient-to-r from-transparent via-vivo-neon to-transparent shadow-neon" />
        <div className="time-ring small" />
        <img className="absolute bottom-0 left-1/2 w-[74%] max-w-none -translate-x-1/2 clock-float drop-shadow-[0_0_34px_rgba(155,45,255,0.82)]" src={neonClock} alt="" />
        <img className="logo-hover absolute right-4 top-4 h-28 object-contain drop-shadow-[0_0_24px_rgba(192,132,252,0.9)]" src={vivinhoLogo} alt="" />
      </div>
    </div>
  );
}

function IdentificationStep({
  data,
  errors,
  updateField,
  addCoParticipant,
  removeCoParticipant,
  updateCoParticipant,
}: StepProps & {
  addCoParticipant: () => void;
  removeCoParticipant: (id: string) => void;
  updateCoParticipant: (id: string, patch: Partial<CoParticipant>) => void;
}) {
  return (
    <div>
      <StepHeading title="Identificação do projeto" description="Informe o nome, área responsável, liderança e demais participantes." />
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <TextField
          label="Nome do Projeto"
          maxLength={80}
          value={data.projectName}
          onChange={(value) => updateField("projectName", value)}
          error={errors.projectName}
          placeholder="Smart Repair | Redução Inteligente de Reparos em Campo"
        />
        <SelectField
          label="Área Responsável"
          value={data.responsibleArea}
          onChange={(value) => updateField("responsibleArea", value)}
          options={responsibleAreas}
          error={errors.responsibleArea}
        />
        <TextField
          label="Líder do Projeto"
          maxLength={60}
          value={data.projectLeader}
          onChange={(value) => updateField("projectLeader", value)}
          error={errors.projectLeader}
          placeholder="Gabriela Paula da Silva"
        />
        <TextField
          label="E-mail do líder"
          type="email"
          icon={<Mail size={16} />}
          value={data.leaderEmail}
          onChange={(value) => updateField("leaderEmail", value)}
          error={errors.leaderEmail}
          placeholder={`lider@${allowedEmailDomain}`}
        />
      </div>

      <div className="mt-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <StepHeading title="Coparticipantes" description="Inclua pessoas ou equipes envolvidas. Este campo é opcional." />
          <button className="btn-secondary" type="button" onClick={addCoParticipant}>
            <Plus size={18} />
            Adicionar
          </button>
        </div>

        {data.coParticipants.length > 0 && (
          <div className="mt-4 space-y-3">
            {data.coParticipants.map((participant, index) => (
              <div key={participant.id} className="participant-card rounded-lg border border-white/10 bg-white/[0.035] p-4">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h3 className="font-semibold text-white">Coparticipante {index + 1}</h3>
                  <button className="icon-button" type="button" onClick={() => removeCoParticipant(participant.id)} aria-label="Remover co participante">
                    <Trash2 size={17} />
                  </button>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <TextField
                    label="Nome ou equipe"
                    maxLength={60}
                    value={participant.name}
                    onChange={(value) => updateCoParticipant(participant.id, { name: value })}
                    error={errors[`coParticipant-${participant.id}-name`]}
                    placeholder="Equipe Qualidade, Produção, Processos"
                  />
                  <TextField
                    label="E-mail, se houver"
                    type="email"
                    icon={<Mail size={16} />}
                    value={participant.email}
                    onChange={(value) => updateCoParticipant(participant.id, { email: value })}
                    error={errors[`coParticipant-${participant.id}-email`]}
                    placeholder={`nome@${allowedEmailDomain}`}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectStep(props: StepProps) {
  const { data, errors, updateField } = props;
  return (
    <div>
      <StepHeading title="Projeto" description="Detalhe o objetivo, a descrição executiva e se há ganho financeiro associado." />
      <div className="mt-6 space-y-5">
        <div>
          <span className="field-label">O projeto possui ganho financeiro?</span>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            {[
              ["yes", "Sim"],
              ["no", "Não"],
            ].map(([value, label]) => (
              <button
                key={value}
                className={`choice-button ${data.hasFinancialGain === value ? "selected" : ""}`}
                type="button"
                onClick={() => updateField("hasFinancialGain", value as FormDataState["hasFinancialGain"])}
              >
                {label}
              </button>
            ))}
          </div>
          <FieldError message={errors.hasFinancialGain} />
        </div>

        {data.hasFinancialGain === "yes" && (
          <TextArea
            label="Descreva o ganho financeiro"
            maxLength={300}
            value={data.financialGainDescription}
            onChange={(value) => updateField("financialGainDescription", value)}
            error={errors.financialGainDescription}
            placeholder="Redução estimada de custos operacionais relacionados a deslocamentos técnicos e retrabalho."
          />
        )}

        <TextArea
          label="Objetivo do Projeto"
          maxLength={500}
          value={data.projectObjective}
          onChange={(value) => updateField("projectObjective", value)}
          error={errors.projectObjective}
          placeholder="Reduzir o volume de reparos em campo através da identificação automatizada de ofensores operacionais."
        />
        <TextArea
          label="Descrição do Projeto"
          maxLength={2000}
          value={data.projectDescription}
          onChange={(value) => updateField("projectDescription", value)}
          error={errors.projectDescription}
          placeholder="Explique como a solução funciona, quais tecnologias utiliza e como apoia a operação."
        />
      </div>
    </div>
  );
}

function StrategicImpactStep({
  data,
  errors,
  updateField,
  toggleListValue,
}: StepProps & {
  toggleListValue: <K extends "strategicImpacts" | "impactedProducts">(key: K, value: string) => void;
}) {
  return (
    <div>
      <StepHeading title="Impacto estratégico" description="Selecione os impactos e descreva a jornada de AS IS para TO BE." />
      <div className="mt-6 grid gap-5">
        <CheckboxGroup
          label="Impacto Estratégico"
          options={strategicImpactOptions}
          selected={data.strategicImpacts}
          onToggle={(value) => toggleListValue("strategicImpacts", value)}
          error={errors.strategicImpacts}
        />
        <TextArea
          label="Situação Atual (AS IS)"
          maxLength={700}
          value={data.currentSituation}
          onChange={(value) => updateField("currentSituation", value)}
          error={errors.currentSituation}
          placeholder="Atualmente as análises são realizadas manualmente através de diferentes bases e planilhas."
        />
        <TextArea
          label="Situação Futura (TO BE)"
          maxLength={700}
          value={data.futureSituation}
          onChange={(value) => updateField("futureSituation", value)}
          error={errors.futureSituation}
          placeholder="Os indicadores serão monitorados automaticamente em dashboard único com visão executiva."
        />
      </div>
    </div>
  );
}

function ResultsStep({
  data,
  errors,
  updateField,
  toggleListValue,
}: StepProps & {
  toggleListValue: <K extends "strategicImpacts" | "impactedProducts">(key: K, value: string) => void;
}) {
  return (
    <div className="relative overflow-hidden">
      <img className="pointer-events-none absolute -right-20 bottom-0 hidden w-[54%] max-w-xl opacity-20 bridge-glow md:block" src={ponteEstaiada} alt="" />
      <div className="relative">
        <StepHeading title="Benefícios e resultados" description="Organize produtos impactados, premissas e resultados esperados." />
        <div className="mt-6 grid gap-5">
          <TextArea
            label="Benefícios do Projeto"
            maxLength={700}
            value={data.projectBenefits}
            onChange={(value) => updateField("projectBenefits", value)}
            error={errors.projectBenefits}
            placeholder="Redução de reparos, aumento de produtividade e melhoria da experiência do cliente."
          />
          <CheckboxGroup
            label="Produtos Impactados"
            options={impactedProductOptions}
            selected={data.impactedProducts}
            onToggle={(value) => toggleListValue("impactedProducts", value)}
            error={errors.impactedProducts}
            searchable
          />
          <TextArea
            label="Premissas"
            maxLength={500}
            value={data.assumptions}
            onChange={(value) => updateField("assumptions", value)}
            error={errors.assumptions}
            placeholder="Disponibilidade das bases operacionais e manutenção dos acessos SQL. Use N/A se não houver."
          />
          <TextArea
            label="Resultados Esperados"
            maxLength={700}
            value={data.expectedResults}
            onChange={(value) => updateField("expectedResults", value)}
            error={errors.expectedResults}
            placeholder="Redução de até 15% no volume de reparos em campo."
          />
        </div>
      </div>
    </div>
  );
}

function EvidenceStep({
  evidence,
  errors,
  updateEvidenceLink,
}: {
  evidence: Evidence;
  errors: Record<string, string>;
  updateEvidenceLink: (value: string) => void;
}) {
  return (
    <div>
      <StepHeading title="Evidências" description="Crie uma pasta no OneDrive com o vídeo, a apresentação e demais evidências do projeto. Compartilhe a pasta e cole o link abaixo." />
      <div className="mt-6 grid gap-4">
        <div className="rounded-lg border border-vivo-neon/25 bg-vivo-purple/10 p-4 text-sm leading-6 text-vivo-text">
          A pasta deve estar compartilhada para acesso da equipe avaliadora. Inclua nela o vídeo do projeto, a apresentação em
          PowerPoint e qualquer evidência complementar.
        </div>
        <TextField
          label="Link da pasta compartilhada no OneDrive"
          type="url"
          icon={<LinkIcon size={16} />}
          value={evidence.oneDriveFolderLink}
          onChange={updateEvidenceLink}
          error={errors.oneDriveFolderLink}
          placeholder="https://..."
        />
      </div>
    </div>
  );
}

function ReviewStep({
  data,
  submitState,
  submitMessage,
  onDownloadXlsx,
}: {
  data: FormDataState;
  submitState: string;
  submitMessage: string;
  onDownloadXlsx: () => void;
}) {
  return (
    <div>
      <StepHeading title="Revisão antes do envio" description="Confira as respostas e baixe uma cópia organizada em XLSX antes de enviar." />
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <ReviewCard
          title="Identificação"
          items={[
            ["Nome do Projeto", data.projectName],
            ["Área Responsável", data.responsibleArea],
            ["Líder do Projeto", data.projectLeader],
            ["E-mail do líder", data.leaderEmail],
            ["Coparticipantes", formatCoParticipants(data.coParticipants)],
          ]}
        />
        <ReviewCard
          title="Projeto"
          items={[
            ["Possui ganho financeiro?", data.hasFinancialGain === "yes" ? "Sim" : "Não"],
            ["Ganho financeiro", data.financialGainDescription || "N/A"],
            ["Objetivo", data.projectObjective],
            ["Descrição", data.projectDescription],
          ]}
        />
        <ReviewCard
          title="Impacto estratégico"
          items={[
            ["Impactos", data.strategicImpacts.join(", ")],
            ["Situação Atual (AS IS)", data.currentSituation],
            ["Situação Futura (TO BE)", data.futureSituation],
          ]}
        />
        <ReviewCard
          title="Resultados"
          items={[
            ["Benefícios", data.projectBenefits],
            ["Produtos Impactados", data.impactedProducts.join(", ")],
            ["Premissas", data.assumptions || "N/A"],
            ["Resultados Esperados", data.expectedResults],
          ]}
        />
        <ReviewCard
          title="Evidências"
          items={[
            ["Pasta OneDrive", data.evidence.oneDriveFolderLink],
          ]}
        />
      </div>

      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <button className="btn-secondary" type="button" onClick={onDownloadXlsx}>
          <Download size={18} />
          Baixar XLSX das respostas
        </button>
      </div>
      {submitState === "error" && <StatusMessage type="error" message={submitMessage} />}
    </div>
  );
}

function ConfirmationStep({
  submitState,
  submitMessage,
  onDownloadXlsx,
}: {
  submitState: string;
  submitMessage: string;
  onDownloadXlsx: () => void;
}) {
  const isSuccess = submitState === "success";
  return (
    <div className="grid min-h-[460px] place-items-center text-center">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-xl">
        <div className={`success-orb mx-auto grid h-24 w-24 place-items-center rounded-full border ${isSuccess ? "border-emerald-300/60 bg-emerald-400/10 text-emerald-200" : "border-vivo-neon/50 bg-vivo-purple/20 text-vivo-lilac"} shadow-neon`}>
          {isSuccess ? <CheckCircle2 size={48} /> : <Rocket size={48} />}
        </div>
        <h2 className="mt-7 text-4xl font-black">{isSuccess ? "Inscrição enviada!" : "Portal pronto."}</h2>
        <p className="mt-4 text-vivo-text">{submitMessage || "Quando o endpoint estiver configurado, o envio seguirá para o Power Automate."}</p>
        <button className="btn-primary mt-7" type="button" onClick={onDownloadXlsx}>
          <Download size={18} />
          Baixar XLSX das respostas
        </button>
      </motion.div>
    </div>
  );
}

function StepHeading({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h2 className="text-3xl font-black leading-tight sm:text-4xl">{title}</h2>
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
  placeholder,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
  icon?: React.ReactNode;
  placeholder?: string;
  maxLength?: number;
}) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      <span className="relative block">
        {icon && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-vivo-lilac">{icon}</span>}
        <input
          className={`field-input ${icon ? "field-input-with-icon" : ""}`}
          type={type}
          value={value}
          maxLength={maxLength}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      </span>
      {maxLength && <CharacterCount value={value} maxLength={maxLength} />}
      <FieldError message={error} />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  error?: string;
}) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      <select className="field-input" value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">Selecione uma opção</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <FieldError message={error} />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  error,
  placeholder,
  className = "",
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  className?: string;
  maxLength?: number;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="field-label">{label}</span>
      <textarea
        className="field-input min-h-32 resize-y"
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
      {maxLength && <CharacterCount value={value} maxLength={maxLength} />}
      <FieldError message={error} />
    </label>
  );
}

function CheckboxGroup({
  label,
  options,
  selected,
  onToggle,
  error,
  searchable = false,
}: {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
  error?: string;
  searchable?: boolean;
}) {
  const [query, setQuery] = useState("");
  const normalizedQuery = normalizeSearch(query);
  const visibleOptions = searchable && normalizedQuery
    ? options.filter((option) => normalizeSearch(option).includes(normalizedQuery))
    : options;

  return (
    <fieldset>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
        <legend className="field-label mb-0">{label}</legend>
        <span className="text-xs font-semibold text-vivo-lilac">{selected.length} selecionado(s)</span>
      </div>
      {searchable && (
        <TextField
          label="Buscar produto"
          value={query}
          onChange={setQuery}
          placeholder="Digite para filtrar as opções"
        />
      )}
      {selected.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {selected.map((option) => (
            <button key={option} className="selected-chip" type="button" onClick={() => onToggle(option)}>
              {option}
              <XCircle size={14} />
            </button>
          ))}
        </div>
      )}
      <div className={`mt-3 ${searchable ? "option-scroll" : "flex flex-wrap gap-2"}`}>
        {visibleOptions.map((option) => (
          <button
            key={option}
            className={`checkbox-option ${selected.includes(option) ? "selected" : ""}`}
            type="button"
            aria-pressed={selected.includes(option)}
            onClick={() => onToggle(option)}
          >
            <ClipboardCheck size={18} />
            {option}
          </button>
        ))}
        {visibleOptions.length === 0 && <p className="text-sm text-vivo-text">Nenhuma opção encontrada.</p>}
      </div>
      <FieldError message={error} />
    </fieldset>
  );
}

function ReviewCard({ title, items }: { title: string; items: string[][] }) {
  return (
    <div className="review-card rounded-lg border border-white/10 bg-white/[0.035] p-4">
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

function CharacterCount({ value, maxLength }: { value: string; maxLength: number }) {
  return (
    <span className="mt-1 block text-right text-xs text-white/45">
      {value.length}/{maxLength}
    </span>
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

function requireText(errors: Record<string, string>, key: string, value: string, maxLength?: number) {
  if (!value.trim()) errors[key] = "Campo obrigatório.";
  else if (maxLength && value.length > maxLength) errors[key] = `Use no máximo ${maxLength} caracteres.`;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function omitKey<T extends Record<string, string>>(record: T, key: string) {
  const next = { ...record };
  delete next[key];
  return next;
}

function isValidUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function buildPayload(data: FormDataState) {
  return {
    submittedAt: new Date().toISOString(),
    source: "vivo-back-to-future-form",
    identification: {
      projectName: data.projectName.trim(),
      responsibleArea: data.responsibleArea,
      projectLeader: data.projectLeader.trim(),
      leaderEmail: data.leaderEmail.trim(),
      coParticipants: data.coParticipants.map((participant) => ({
        name: participant.name.trim(),
        email: participant.email.trim(),
      })),
    },
    project: {
      hasFinancialGain: data.hasFinancialGain === "yes",
      financialGainDescription: data.financialGainDescription.trim() || "N/A",
      projectObjective: data.projectObjective.trim(),
      projectDescription: data.projectDescription.trim(),
      strategicImpacts: data.strategicImpacts,
      currentSituation: data.currentSituation.trim(),
      futureSituation: data.futureSituation.trim(),
      projectBenefits: data.projectBenefits.trim(),
      impactedProducts: data.impactedProducts,
      assumptions: data.assumptions.trim() || "N/A",
      expectedResults: data.expectedResults.trim(),
    },
    evidence: {
      oneDriveFolderLink: data.evidence.oneDriveFolderLink.trim(),
    },
  };
}

async function exportResponsesXlsx(data: FormDataState) {
  const answerRows = [
    ["Campo", "Resposta"],
    ["Nome do Projeto", data.projectName],
    ["Área Responsável", data.responsibleArea],
    ["Líder do Projeto", data.projectLeader],
    ["E-mail do líder", data.leaderEmail],
    ["Coparticipantes", formatCoParticipants(data.coParticipants)],
    ["O projeto possui ganho financeiro?", data.hasFinancialGain === "yes" ? "Sim" : "Não"],
    ["Descreva o ganho financeiro", data.financialGainDescription || "N/A"],
    ["Objetivo do Projeto", data.projectObjective],
    ["Descrição do Projeto", data.projectDescription],
    ["Impacto Estratégico", data.strategicImpacts.join(", ")],
    ["Situação Atual (AS IS)", data.currentSituation],
    ["Situação Futura (TO BE)", data.futureSituation],
    ["Benefícios do Projeto", data.projectBenefits],
    ["Produtos Impactados", data.impactedProducts.join(", ")],
    ["Premissas", data.assumptions || "N/A"],
    ["Resultados Esperados", data.expectedResults],
  ];

  const fileRows = [
    ["Tipo", "Link"],
    ["Pasta OneDrive", data.evidence.oneDriveFolderLink],
  ];

  await writeXlsxFile([
    {
      sheet: "Respostas",
      data: answerRows,
      columns: [{ width: 34 }, { width: 90 }],
      stickyRowsCount: 1,
    },
    {
      sheet: "Anexos",
      data: fileRows,
      columns: [{ width: 32 }, { width: 70 }],
      stickyRowsCount: 1,
    },
  ]).toFile(`respostas-${slugify(data.projectName || "projeto")}.xlsx`);
}

function formatCoParticipants(coParticipants: CoParticipant[]) {
  if (coParticipants.length === 0) return "N/A";
  return coParticipants
    .map((participant) => `${participant.name}${participant.email ? ` (${participant.email})` : ""}`)
    .join("; ");
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function loadSavedDraft(): FormDataState {
  if (typeof window === "undefined") return initialData;

  try {
    const saved = window.localStorage.getItem(draftStorageKey);
    if (!saved) return initialData;
    return normalizeDraft(JSON.parse(saved) as Partial<FormDataState>);
  } catch {
    return initialData;
  }
}

function normalizeDraft(value: Partial<FormDataState>): FormDataState {
  return {
    ...initialData,
    ...value,
    coParticipants: Array.isArray(value.coParticipants) ? value.coParticipants : initialData.coParticipants,
    strategicImpacts: Array.isArray(value.strategicImpacts) ? value.strategicImpacts : initialData.strategicImpacts,
    impactedProducts: Array.isArray(value.impactedProducts) ? value.impactedProducts : initialData.impactedProducts,
    evidence: {
      oneDriveFolderLink: value.evidence?.oneDriveFolderLink ?? "",
    },
  };
}

export default App;
