import { useEffect, useMemo, useState } from "react";
import { fetchCurrentUser, updateUserProfile } from "../api-client";
import { useNavigate } from "react-router-dom";
import { UseAppContext } from "../contexts/AppContext";
import Select from "react-select";
import countryList from "react-select-country-list";

const EditProfile = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    country: "",
    phoneNumber: "",
  });
  const [selectedCountry, setSelectedCountry] = useState<{
    value: string;
    label: string;
  } | null>(null);
  const countryOptions = useMemo(() => countryList().getData(), []);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { showToast } = UseAppContext();

  useEffect(() => {
    const getUser = async () => {
      try {
        const user = await fetchCurrentUser();
        if (!user) {
          navigate("/sign-in");
          return;
        }

        setForm({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          country: user.country,
          phoneNumber: user.phoneNumber,
        });

        const matchedOption = countryOptions.find(
          (option) => option.value === user.country
        );
        setSelectedCountry(matchedOption || null);
      } catch (err) {
        console.error("Failed to load user", err);
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, [navigate, countryOptions]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateUserProfile({
        ...form,
        country: selectedCountry ? selectedCountry.value : "",
      });

      showToast({ message: "Profile updated successfully", type: "SUCCESS" });
      navigate("/");
    } catch (error) {
      console.error("Update failed:", error);
      alert("Update failed. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center pt-[30vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-10 " />
          <p className="text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Edit Profile</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* First Name */}
        <div>
          <label
            htmlFor="firstName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            First Name
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            placeholder="First Name"
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>

        {/* Last Name */}
        <div>
          <label
            htmlFor="lastName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Last Name
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            placeholder="Last Name"
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>

        {/* Country */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Country
          </label>
          <Select
            options={countryOptions}
            value={selectedCountry}
            onChange={(option) => {
              setSelectedCountry(option);
              setForm((prev) => ({ ...prev, country: option?.value || "" }));
            }}
            placeholder="Select your country"
            isSearchable
          />
        </div>

        {/* Phone Number */}
        <div>
          <label
            htmlFor="phoneNumber"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Phone Number
          </label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={form.phoneNumber}
            onChange={handleChange}
            placeholder="Phone Number"
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default EditProfile;
