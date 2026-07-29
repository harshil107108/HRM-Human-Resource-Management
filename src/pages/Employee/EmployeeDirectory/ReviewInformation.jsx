import React, { useState } from "react";
import {
  User,
  Building2,
  Landmark,
} from "lucide-react";

import SummaryCard from "./SummaryCard";
import InfoItem from "./Review/InfoItem";
import ValidationCard from "./Review/ValidationCard";
import DocumentsCard from "./Review/DocumentsCard";
import SystemAccessCard from "./SystemAccessCard";
import DeclarationCard from "./Review/DeclarationCard";
import FooterActions from "./Review/FooterActions";

import {
  personalInfo,
  organizationInfo,
  payrollInfo,
  documents,
  systemAccess,
} from "./Review/reviewData";

const ReviewInformation = ({
  onBack,
  onSubmit,
}) => {

  const [confirm, setConfirm] = useState(false);

  return (

    <div className="mx-auto max-w-7xl space-y-6">

      {/* Header */}

      <div>

        <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
          Final Review
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Review & Confirmation
        </h1>

        <p className="mt-2 max-w-3xl text-slate-500">
          Verify all employee information before creating the employee profile.
        </p>

      </div>

      {/* Main Layout */}

      <div className="grid grid-cols-12 gap-6">

        {/* Left */}

        <div className="col-span-12 space-y-6 xl:col-span-8">

          <SummaryCard
            title="Personal & Contact Information"
            icon={<User size={20} />}
          >

            {personalInfo.map((item) => (
              <InfoItem
                key={item.label}
                {...item}
              />
            ))}

          </SummaryCard>

          <SummaryCard
            title="Organization Information"
            icon={<Building2 size={20} />}
          >

            {organizationInfo.map((item) => (
              <InfoItem
                key={item.label}
                {...item}
              />
            ))}

          </SummaryCard>

          <SummaryCard
            title="Compensation & Banking"
            icon={<Landmark size={20} />}
          >

            {payrollInfo.map((item) => (
              <InfoItem
                key={item.label}
                {...item}
              />
            ))}

          </SummaryCard>

        </div>

        {/* Right */}

        <div className="col-span-12 space-y-6 xl:col-span-4">

          <ValidationCard />

          <DocumentsCard
            documents={documents}
          />

          <SystemAccessCard
            access={systemAccess}
          />

          <DeclarationCard
            checked={confirm}
            onChange={() =>
              setConfirm(!confirm)
            }
          />

        </div>

      </div>

      <FooterActions
        onBack={onBack}
        onSubmit={onSubmit}
        disabled={!confirm}
      />

    </div>

  );
};


export default ReviewInformation