import { HpGrid } from "@/hp-grid/src";
import { useNavigate } from "react-router-dom";
import useJobOpeningConfig from "./useJobOpeningConfig";
import { api, apiEndpoints } from "@/api/api";
import { useState, useEffect } from "react";
import useApiCall from "@/hooks/useApiCall";
import useAlert from "@/hooks/useAlert";
import useDocumentTitle from "@/hooks/useDocumentTitle";

const JobOpeningListing = () => {
  const { deleteAlert, successAlert } = useAlert();
  const { apiCall, isPending } = useApiCall();
  const navigate = useNavigate();

  const handleDelete = async (id) => {
    deleteAlert({
      title: "Delete Job Opening?",
      text: "Are you sure you want to delete this job opening? This action cannot be undone.",

      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",

      onClick: async () => {
        const res = await apiCall({
          id: "deleteJobOpening",
          api: api + apiEndpoints.recruitment.jobOpening.JobOpeningDeleteByID,
          payload: {
            _id: id,
          },
        });

        if (res.success) {
          successAlert({
            title: "Job opening deleted",
            text: "Job opening has been deleted successfully.",
          });

          getJobListing();
        }
      },
    });
  };

  const { jobOpeningListingColDef } = useJobOpeningConfig({
    handleDelete,
  });

  const [jobListingData, setJobListingData] = useState([]);

  const handleDoubleClick = (params) => {
    const { data } = params;

    navigate(`${location.pathname}/addedit`, {
      state: {
        jobOpeningId: data?._id,
      },
    });
  };

  const handleAdd = () => {
    navigate(`${location.pathname}/addedit`, {
      state: {
        jobOpeningId: null,
      },
    });
  };

  const getJobListing = async () => {
    const res = await apiCall({
      id: "getJobListing",
      api: api + apiEndpoints.recruitment.jobOpening.JobOpeningGetData,
      payload: {},
    });

    if (res?.success) {
      const data = res?.data?.data || [];

      setJobListingData(data);
    }
  };

  useEffect(() => {
    getJobListing();
  }, []);

  useDocumentTitle("orvexa | Job Openings");

  return (
    <>
      <HpGrid
        id="jobListing"
        rowData={jobListingData}
        colDef={jobOpeningListingColDef}
        style={{ height: "100%" }}
        onDoubleClick={handleDoubleClick}
        onAddClick={handleAdd}
        title="Job Openings"
        panding={
          isPending("deleteListing") || isPending("getDepartmentListing")
        }
      />
    </>
  );
};

export default JobOpeningListing;
