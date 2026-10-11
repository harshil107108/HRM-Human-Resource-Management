import { confirmDialog } from "@/components/feedback";

export async function confirmStatusChange({
  fieldName = "status",
  currentValue,
  nextValue,
  currentLabel,
  nextLabel,
}) {
  if (String(currentValue ?? "") === String(nextValue ?? "")) {
    return true;
  }

  const result = await confirmDialog({
    variant: "warning",
    iconName: "warning",
    title: "Confirm Status Change",
    text: `Change ${fieldName} from "${currentLabel || currentValue || "Not set"}" to "${nextLabel || nextValue || "Not set"}"?`,
    confirmButtonText: "Yes, continue",
    cancelButtonText: "No, keep current",
  });

  return Boolean(result.isConfirmed);
}
