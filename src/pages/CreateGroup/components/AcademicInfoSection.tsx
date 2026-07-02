import { School2Icon } from "lucide-react";
import SectionCard from "./SectionCard";
import { use, useEffect, useState } from "react";
import { Subject } from "../../Onboarding/components";
import { getAllSubjectsByCurriculum } from "../../../services/GroupService";
import store from "../../../redux/store";
import { useDispatch } from "react-redux";
import { Autocomplete, TextField } from "@mui/material";

interface AcademicInfoSectionProps {
  mainSubject: Subject | null;
  onMainSubjectChange: (next: Subject | null) => void;
  curriculumId: number | null;
}

export default function AcademicInfoSection({
  mainSubject,
  onMainSubjectChange,
  curriculumId,
}: AcademicInfoSectionProps) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const dispatch = useDispatch();
  useEffect(() => {
    console.log("AcademicInfoSection - mainSubject:", mainSubject);
    const fetchSubjects = async () => {
      const response = await getAllSubjectsByCurriculum(curriculumId || 1);
      setSubjects(response.data);
    };

    fetchSubjects();
  }, [curriculumId]);
  return (
    <SectionCard
      icon={<School2Icon className="h-5 w-5" />}
      title="Thông tin học thuật"
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Môn học chính
          </label>
          <Autocomplete
            options={subjects}
            getOptionLabel={(option) => option.subjectName}
            value={mainSubject}
            onChange={(_, newValue) => {
              onMainSubjectChange(newValue);
            }}
            noOptionsText="Không tìm thấy môn học"
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Tìm môn học..."
                size="small"
                sx={{
                  width: "100%",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "0.75rem",
                    backgroundColor: "#ffffff",
                    minHeight: "44px",
                    "& fieldset": { borderColor: "#e2e8f0" },
                    "&:hover fieldset": { borderColor: "#cbd5e1" },
                    "&.Mui-focused fieldset": {
                      borderColor: "#86efac",
                      borderWidth: "1px",
                    },
                  },
                }}
              />
            )}
          />
        </div>
      </div>
    </SectionCard>
  );
}

