import { formMethod } from "@/form-engine";
import { useState } from "react";
import BasicInformation from "./BasicInformation";
import JobInformation from "./JobInformation";
import Organization from "./Organization";
import ReviewSetup from "./ReviewSetup";
import SetupWizard from "./SetupWizard";
import useDesignationConfig from "./useDesignationConfig";


const steps = [
  { key: "basic", label: "Basic Info", component: BasicInformation },
  { key: "jobinformation", label: "Job Information", component: JobInformation },
  { key: "organization", label: "Organization", component: Organization },
  { key: "review", label: "Review", component: ReviewSetup },
];

const Designation = () => {
  const [activeStep, setActiveStep] = useState(0);

  const initialValue = {
    companyName: '',
    legalName: '',
    companyCode: '',
    businessEmail: '',
    phone: '',
    website: '',
    establishDate: '',
    registrationNumber: null,
    panNumber: null,
    gstNumber: null,
    industry: "",
    date: Date.now(),
    companySize: '',
    addressLine1: '',
    addressLine2: '',
    country: '',
    state: '',
    city: '',
    postalCode: "",
  };

  const { basicInfoSchema } = useDesignationConfig();

  const formmethod = formMethod.createForm({
    schema: [
      ...basicInfoSchema,
    ],
    initialValue,
  });

  const handleNext = () => {
    setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  const handleStepSelect = (index) => {
    setActiveStep(index);
  };

  const CurrentStepComponent = steps[activeStep].component;

  return (
    <div className="min-h-screen rounded-3xl bg-white border border-slate-200 shadow-[0_4px_10px_rgba(0,0,0,0.03),0_20px_50px_rgba(0,0,0,0.08)] px-6 py-6">
      <div className="mx-auto flex w-full max-w-7xl gap-8">
        <main className="flex-1">
          <CurrentStepComponent
            onNext={handleNext}
            onBack={handleBack}
            currentStep={activeStep}
            totalSteps={steps.length}
            onStepSelect={handleStepSelect}
            formmethod={formmethod}
          />
        </main>

        <div className="mt-28">
          <SetupWizard
            steps={steps}
            activeStep={activeStep}
            onStepSelect={handleStepSelect}
          />
        </div>
      </div>
    </div>
  );
};

export default Designation;
