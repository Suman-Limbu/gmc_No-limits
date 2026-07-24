import React, { useState } from "react";
import Input from "../../components/ui/Input";
import Dropdown from "../../components/ui/Dropdown";

const Work = () => {
  // 1. Create state to store all form field values
  const [formData, setFormData] = useState({
    headerCollegeName: "",
    headerAddress: "",
    headerLogo: null,
    headerDate: "",
    mainCollegeName: "",
    mainDegree: "",
    mainLogo: null,
    mainDate: "",
  });

  // 2. Generic handler to update state as input changes
  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === "file" ? (files[0] ? files[0].name : "") : value,
    }));
  };

  return (
    <div className="gap-4 max-w-7xl mx-auto px-4 flex flex-col">
      {/* Filter */}
      <div className="max-w-60">
        <Dropdown />
      </div>

      <div className="flex gap-4">
        {/* LEFT FORM SECTION */}
        <div className="rounded-md w-1/2 p-5 border border-gray-300 space-y-4">
          {/* Header Details */}
          <div>
            <label className="text-2xl font-bold text-blue-500 block mb-2">
              Header Details
            </label>
            <div className="flex gap-4 mb-2">
              <Input
                label="College Name"
                placeholder="College name..."
                type="text"
                name="headerCollegeName"
                value={formData.headerCollegeName}
                onChange={handleChange}
              />
              <Input
                label="Address / Location"
                placeholder="Location..."
                type="text"
                name="headerAddress"
                value={formData.headerAddress}
                onChange={handleChange}
              />
            </div>
            <div className="flex gap-4">
              <Input
                label="Logo"
                type="file"
                name="headerLogo"
                onChange={handleChange}
              />
              <Input
                label="Date"
                type="date"
                name="headerDate"
                value={formData.headerDate}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Main Details */}
          <div>
            <label className="text-2xl font-bold text-blue-500 block mb-2">
              Main Details
            </label>
            <div className="flex gap-4 mb-2">
              <Input
                label="College Name"
                placeholder="College name..."
                type="text"
                name="mainCollegeName"
                value={formData.mainCollegeName}
                onChange={handleChange}
              />
              <Input
                label="Degree / Course"
                placeholder="Degree..."
                type="text"
                name="mainDegree"
                value={formData.mainDegree}
                onChange={handleChange}
              />
            </div>
            <div className="flex gap-4">
              <Input
                label="Logo"
                type="file"
                name="mainLogo"
                onChange={handleChange}
              />
              <Input
                label="Date"
                type="date"
                name="mainDate"
                value={formData.mainDate}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* RIGHT PREVIEW SECTION */}
        <div className="border border-gray-300 rounded-md w-1/2 p-5 bg-gray-50 space-y-4">
          <h3 className="text-xl font-bold border-b pb-2 text-gray-700">Live Preview</h3>
          
          {/* Header Preview */}
          <div className="bg-white p-4 rounded shadow-sm">
            <h4 className="text-md font-semibold text-blue-600 mb-2">Header Summary</h4>
            <p><strong>College:</strong> {formData.headerCollegeName || "—"}</p>
            <p><strong>Address:</strong> {formData.headerAddress || "—"}</p>
            <p><strong>Logo File:</strong> {formData.headerLogo || "No file chosen"}</p>
            <p><strong>Date:</strong> {formData.headerDate || "—"}</p>
          </div>

          {/* Main Details Preview */}
          <div className="bg-white p-4 rounded shadow-sm">
            <h4 className="text-md font-semibold text-blue-600 mb-2">Main Details Summary</h4>
            <p><strong>College:</strong> {formData.mainCollegeName || "—"}</p>
            <p><strong>Degree:</strong> {formData.mainDegree || "—"}</p>
            <p><strong>Logo File:</strong> {formData.mainLogo || "No file chosen"}</p>
            <p><strong>Date:</strong> {formData.mainDate || "—"}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Work;