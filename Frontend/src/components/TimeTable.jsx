import { useEffect, useState } from "react";
import { getSubjectsBySem } from "../services/subjectService";
import { getWorkload } from "../services/workloadService";
import GlassCard from "./GlassCard";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const TIME_SLOTS = [
  "9-10",
  "10-11",
  "11-12",
  "12-1",
  "1-2",
  "2-3",
  "3-4",
];

const DEPT = "CT";
const SEM = 6;

const TimetableOutput = () => {
  const [subjects, setSubjects] = useState([]);
  const [workload, setWorkload] = useState([]);
  const [sections, setSections] = useState([]);
  const [timetable, setTimetable] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const subs = await getSubjectsBySem(DEPT, SEM);
      const wl = await getWorkload(DEPT, SEM);

      setSubjects(subs);
      setWorkload(wl);

      const uniqueSections = [...new Set(wl.map(w => w.section))];
      setSections(uniqueSections);

      generateTimetable(subs, wl, uniqueSections);
    } catch (err) {
      console.error("Error loading timetable data:", err);
    }
  };

  const generateTimetable = (subs, wl, sections) => {
    const table = {};

    sections.forEach(section => {
      table[section] = {};

      DAYS.forEach(day => {
        table[section][day] = Array(TIME_SLOTS.length).fill("-");
      });

      let slotIndex = 0;

      wl.filter(w => w.section === section).forEach(assign => {
        const subject = subs.find(s => s.id === assign.subject.id);
        if (!subject) return;

        for (let i = 0; i < subject.weeklyLectureCount; i++) {
          const day = DAYS[Math.floor(slotIndex / TIME_SLOTS.length) % DAYS.length];
          const time = slotIndex % TIME_SLOTS.length;

          table[section][day][time] =
            `${subject.alias} (${assign.teacher.alias})`;

          slotIndex++;
        }
      });
    });

    setTimetable(table);
  };

  return (
    <div className="space-y-8">

      <h1 className="text-2xl font-bold text-white">
        Generated Timetable
      </h1>

      {sections.map(section => (
        <GlassCard key={section} className="overflow-x-auto">
          <h2 className="text-lg font-semibold text-white mb-4">
            Section {section}
          </h2>

          <table className="min-w-full text-white text-center border-collapse">
            <thead>
              <tr className="bg-white/20">
                <th className="p-3 border border-white/20">
                  Day / Time
                </th>
                {TIME_SLOTS.map((slot, i) => (
                  <th
                    key={i}
                    className="p-3 border border-white/20"
                  >
                    {slot}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {DAYS.map(day => (
                <tr key={day} className="hover:bg-white/10 transition">
                  <td className="p-3 border border-white/20 font-semibold bg-white/20">
                    {day}
                  </td>

                  {timetable[section]?.[day]?.map((cell, i) => (
                    <td
                      key={i}
                      className="p-3 border border-white/20"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </GlassCard>
      ))}
    </div>
  );
};

export default TimetableOutput;
