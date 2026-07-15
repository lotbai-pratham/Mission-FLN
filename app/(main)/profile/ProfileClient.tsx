"use client";

import { useState, useTransition, useRef } from "react";
import { User, Lock, Upload, School as SchoolIcon, Users, UserPlus, Check, X, Shield, BookOpen, Trash2 } from "lucide-react";
import { updateProfilePicture, changePassword, updateSchoolDetails, addTeacher, deleteTeacher, addStudentToSchool } from "@/app/actions/profile";
import { cn } from "@/lib/utils";

export default function ProfileClient({ user, isSchoolUser }: { user: any; isSchoolUser: boolean }) {
  const [activeTab, setActiveTab] = useState<'account' | 'school' | 'teachers' | 'students'>('account');
  const [isPending, startTransition] = useTransition();

  // Account State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdMsg, setPwdMsg] = useState("");

  // School Details State
  const [schoolType, setSchoolType] = useState(user.school?.schoolType || "");
  const [medium, setMedium] = useState(user.school?.medium || "");
  const [principalName, setPrincipalName] = useState(user.school?.principalName || "");
  const [principalMobile, setPrincipalMobile] = useState(user.school?.principalMobile || "");
  const [schoolMsg, setSchoolMsg] = useState("");

  // Teacher State
  const [teacherName, setTeacherName] = useState("");
  const [teacherMobile, setTeacherMobile] = useState("");
  const [teacherClass, setTeacherClass] = useState("");
  const [teacherMsg, setTeacherMsg] = useState("");

  // Student State
  const [studentName, setStudentName] = useState("");
  const [studentClass, setStudentClass] = useState("1");
  const [studentMsg, setStudentMsg] = useState("");

  // Handlers
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      startTransition(async () => {
        try {
          await updateProfilePicture(base64);
          alert("Profile picture updated!");
        } catch (error) {
          alert("Failed to update profile picture.");
        }
      });
    };
    reader.readAsDataURL(file);
  };

  const handlePasswordChange = () => {
    if (newPassword.length < 4) {
      setPwdMsg("Password is too short.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdMsg("Passwords do not match.");
      return;
    }
    setPwdMsg("");
    startTransition(async () => {
      try {
        await changePassword(newPassword);
        setPwdMsg("Password changed successfully!");
        setNewPassword("");
        setConfirmPassword("");
      } catch (err) {
        setPwdMsg("Failed to change password.");
      }
    });
  };

  const handleSchoolSave = () => {
    startTransition(async () => {
      try {
        await updateSchoolDetails({ schoolType, medium, principalName, principalMobile });
        setSchoolMsg("School details saved successfully!");
      } catch (err) {
        setSchoolMsg("Failed to save school details.");
      }
    });
  };

  const handleAddTeacher = () => {
    if (!teacherName) return;
    startTransition(async () => {
      try {
        await addTeacher({ name: teacherName, mobile: teacherMobile, class: teacherClass });
        setTeacherMsg("Teacher added successfully!");
        setTeacherName("");
        setTeacherMobile("");
        setTeacherClass("");
      } catch (err) {
        setTeacherMsg("Failed to add teacher.");
      }
    });
  };

  const handleDeleteTeacher = (id: string) => {
    if (!confirm("Remove this teacher?")) return;
    startTransition(async () => {
      try {
        await deleteTeacher(id);
      } catch (err) {
        alert("Failed to remove teacher.");
      }
    });
  };

  const handleAddStudent = () => {
    if (!studentName) return;
    startTransition(async () => {
      try {
        await addStudentToSchool({ name: studentName, class: Number(studentClass) });
        setStudentMsg("Student added successfully!");
        setStudentName("");
      } catch (err: any) {
        setStudentMsg(err.message || "Failed to add student.");
      }
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-6">
        <div className="relative group">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 border-4 border-white dark:border-slate-800 shadow-lg flex items-center justify-center">
            {user.image ? (
              <img src={user.image} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="w-10 h-10 text-slate-400" />
            )}
          </div>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors opacity-0 group-hover:opacity-100"
          >
            <Upload className="w-4 h-4" />
          </button>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {user.school?.name || user.name || "User Profile"}
          </h1>
          <div className="flex items-center gap-3 mt-1 text-sm font-medium">
            <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-md uppercase tracking-wider text-[10px] font-black">
              {user.role}
            </span>
            <span className="text-slate-500">{user.email}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Navigation Sidebar */}
        <div className="w-full md:w-64 flex flex-col gap-2 shrink-0">
          <button onClick={() => setActiveTab('account')} className={cn("flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-left", activeTab === 'account' ? "bg-white dark:bg-slate-900 text-blue-600 shadow-sm border border-slate-100 dark:border-slate-800" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50")}>
            <Shield className="w-5 h-5" /> Account Settings
          </button>
          {isSchoolUser && (
            <>
              <button onClick={() => setActiveTab('school')} className={cn("flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-left", activeTab === 'school' ? "bg-white dark:bg-slate-900 text-blue-600 shadow-sm border border-slate-100 dark:border-slate-800" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50")}>
                <SchoolIcon className="w-5 h-5" /> School Details
              </button>
              <button onClick={() => setActiveTab('teachers')} className={cn("flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-left", activeTab === 'teachers' ? "bg-white dark:bg-slate-900 text-blue-600 shadow-sm border border-slate-100 dark:border-slate-800" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50")}>
                <Users className="w-5 h-5" /> Teachers
              </button>
              <button onClick={() => setActiveTab('students')} className={cn("flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-left", activeTab === 'students' ? "bg-white dark:bg-slate-900 text-blue-600 shadow-sm border border-slate-100 dark:border-slate-800" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50")}>
                <UserPlus className="w-5 h-5" /> Students
              </button>
            </>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 dark:border-slate-800 min-h-[400px]">
          
          {/* Account Settings */}
          {activeTab === 'account' && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Security</h2>
                <p className="text-sm text-slate-500">Manage your login ID and password.</p>
              </div>
              
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Login ID / UDISE (Locked)</label>
                  <input type="text" value={user.email} disabled className="w-full bg-slate-50 dark:bg-slate-800/50 text-slate-500 rounded-xl px-4 py-3 border border-slate-200 dark:border-slate-700 font-medium cursor-not-allowed" />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">New Password</label>
                  <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" className="w-full bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl px-4 py-3 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Confirm New Password</label>
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" className="w-full bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl px-4 py-3 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                
                {pwdMsg && (
                  <p className={cn("text-sm font-bold", pwdMsg.includes("success") ? "text-green-600" : "text-red-600")}>{pwdMsg}</p>
                )}

                <button onClick={handlePasswordChange} disabled={isPending || !newPassword || !confirmPassword} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50">
                  {isPending ? "Updating..." : "Change Password"}
                </button>
              </div>
            </div>
          )}

          {/* School Details */}
          {activeTab === 'school' && isSchoolUser && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">School Details</h2>
                <p className="text-sm text-slate-500">Update specific information about your school.</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">School Type</label>
                  <select value={schoolType} onChange={e => setSchoolType(e.target.value)} className="w-full bg-white dark:bg-slate-800 rounded-xl px-4 py-3 border border-slate-200 dark:border-slate-700 outline-none">
                    <option value="">Select Type</option>
                    <option value="1-4">1-4</option>
                    <option value="1-5">1-5</option>
                    <option value="5-10">5-10</option>
                    <option value="5-12">5-12</option>
                    <option value="1-12">1-12</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Medium</label>
                  <select value={medium} onChange={e => setMedium(e.target.value)} className="w-full bg-white dark:bg-slate-800 rounded-xl px-4 py-3 border border-slate-200 dark:border-slate-700 outline-none">
                    <option value="">Select Medium</option>
                    <option value="Marathi">Marathi</option>
                    <option value="English">English</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Principal Name</label>
                  <input type="text" value={principalName} onChange={e => setPrincipalName(e.target.value)} className="w-full bg-white dark:bg-slate-800 rounded-xl px-4 py-3 border border-slate-200 dark:border-slate-700 outline-none" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Principal Mobile No.</label>
                  <input type="text" value={principalMobile} onChange={e => setPrincipalMobile(e.target.value)} className="w-full bg-white dark:bg-slate-800 rounded-xl px-4 py-3 border border-slate-200 dark:border-slate-700 outline-none" />
                </div>
              </div>

              {schoolMsg && (
                <p className={cn("text-sm font-bold", schoolMsg.includes("success") ? "text-green-600" : "text-red-600")}>{schoolMsg}</p>
              )}

              <button onClick={handleSchoolSave} disabled={isPending} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50">
                {isPending ? "Saving..." : "Save Details"}
              </button>
            </div>
          )}

          {/* Teachers Tab */}
          {activeTab === 'teachers' && isSchoolUser && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Teacher Roster</h2>
                <p className="text-sm text-slate-500">Manage teachers for your school.</p>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-500 mb-1">Teacher Name</label>
                  <input type="text" value={teacherName} onChange={e => setTeacherName(e.target.value)} placeholder="Jane Doe" className="w-full bg-white dark:bg-slate-800 rounded-lg px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 outline-none" />
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-500 mb-1">Mobile No.</label>
                  <input type="text" value={teacherMobile} onChange={e => setTeacherMobile(e.target.value)} placeholder="+91..." className="w-full bg-white dark:bg-slate-800 rounded-lg px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 outline-none" />
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-500 mb-1">Class</label>
                  <input type="text" value={teacherClass} onChange={e => setTeacherClass(e.target.value)} placeholder="e.g. 1st to 3rd" className="w-full bg-white dark:bg-slate-800 rounded-lg px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 outline-none" />
                </div>
                <button onClick={handleAddTeacher} disabled={isPending || !teacherName} className="sm:col-span-1 w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2 font-bold text-sm transition-colors disabled:opacity-50 h-9">
                  Add Teacher
                </button>
              </div>

              {teacherMsg && (
                <p className={cn("text-sm font-bold", teacherMsg.includes("success") ? "text-green-600" : "text-red-600")}>{teacherMsg}</p>
              )}

              <div className="mt-6 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Mobile</th>
                      <th className="px-4 py-3">Class</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {user.school?.teachers?.length === 0 && (
                      <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-400">No teachers added yet.</td></tr>
                    )}
                    {user.school?.teachers?.map((t: any) => (
                      <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                        <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">{t.name}</td>
                        <td className="px-4 py-3 text-slate-600">{t.mobile || "—"}</td>
                        <td className="px-4 py-3 text-slate-600">{t.class || "—"}</td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => handleDeleteTeacher(t.id)} disabled={isPending} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Students Tab */}
          {activeTab === 'students' && isSchoolUser && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Student Onboarding</h2>
                <p className="text-sm text-slate-500">Quickly add new students for Grades 1 through 4.</p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end max-w-3xl">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 mb-1">Student Name</label>
                  <input type="text" value={studentName} onChange={e => setStudentName(e.target.value)} placeholder="Full Name" className="w-full bg-white dark:bg-slate-800 rounded-lg px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 outline-none" />
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-500 mb-1">Grade / Class</label>
                  <select value={studentClass} onChange={e => setStudentClass(e.target.value)} className="w-full bg-white dark:bg-slate-800 rounded-lg px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 outline-none">
                    <option value="1">Grade 1</option>
                    <option value="2">Grade 2</option>
                    <option value="3">Grade 3</option>
                    <option value="4">Grade 4</option>
                  </select>
                </div>
                <button onClick={handleAddStudent} disabled={isPending || !studentName} className="sm:col-span-1 w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-4 py-2 font-bold text-sm transition-colors disabled:opacity-50 h-9">
                  Add Student
                </button>
              </div>

              {studentMsg && (
                <p className={cn("text-sm font-bold", studentMsg.includes("success") ? "text-green-600" : "text-red-600")}>{studentMsg}</p>
              )}

              <div className="mt-6">
                <h3 className="text-sm font-bold text-slate-600 mb-3">Recently Added Students</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {user.school?.students?.length === 0 && (
                    <p className="text-slate-400 text-sm italic col-span-3">No students added recently.</p>
                  )}
                  {user.school?.students?.map((s: any) => (
                    <div key={s.id} className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl p-3 flex justify-between items-center shadow-sm">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200 text-sm truncate">{s.name}</p>
                        <p className="text-xs text-slate-500 font-medium font-mono">{s.uid}</p>
                      </div>
                      <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded text-[10px] font-black uppercase">
                        Class {s.class}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
