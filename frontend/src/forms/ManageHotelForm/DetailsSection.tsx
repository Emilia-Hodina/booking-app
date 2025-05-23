import { useFormContext } from "react-hook-form";
import { HotelFormData } from "./ManageHotelForm";
import HotelMapPicker from "../../components/HotelMapPicker";
import { FaMapMarkerAlt } from "react-icons/fa";

const DetailsSection = () => {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<HotelFormData>();

  const lat = watch("location.lat");
  const lng = watch("location.lng");

  const toDMS = (coord: number): string => {
    const absolute = Math.abs(coord);
    const degrees = Math.floor(absolute);
    const minutesNotTruncated = (absolute - degrees) * 60;
    const minutes = Math.floor(minutesNotTruncated);
    const seconds = Math.round((minutesNotTruncated - minutes) * 60);

    return `${degrees}°${minutes}′${seconds}″`;
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold mb-3">Add Hotel</h1>

      {/* Name */}
      <label className="text-gray-700 text-sm font-bold">
        Name
        <input
          type="text"
          className="border rounded w-full py-1 px-2 font-normal"
          {...register("name", { required: "This field is required" })}
        />
        {errors.name && (
          <span className="text-red-500">{errors.name.message}</span>
        )}
      </label>

      {/* City and Country */}
      <div className="flex flex-col md:flex-row gap-4">
        <label className="text-gray-700 text-sm font-bold flex-1">
          City
          <input
            type="text"
            className="border rounded w-full py-1 px-2 font-normal"
            {...register("city", { required: "This field is required" })}
          />
          {errors.city && (
            <span className="text-red-500">{errors.city.message}</span>
          )}
        </label>
        <label className="text-gray-700 text-sm font-bold flex-1">
          Country
          <input
            type="text"
            className="border rounded w-full py-1 px-2 font-normal"
            {...register("country", { required: "This field is required" })}
          />
          {errors.country && (
            <span className="text-red-500">{errors.country.message}</span>
          )}
        </label>
      </div>

      {/* Description and Star Rating */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 space-y-4">
          <label className="text-gray-700 text-sm font-bold block">
            Description
            <textarea
              rows={11}
              className="border rounded w-full py-1 px-2 font-normal"
              {...register("description", {
                required: "This field is required",
              })}
            />
            {errors.description && (
              <span className="text-red-500">{errors.description.message}</span>
            )}
          </label>

          <label className="text-gray-700 text-sm font-bold block">
            Star Rating
            <select
              {...register("starRating", {
                required: "This field is required",
              })}
              className="border rounded w-full p-2 text-gray-700 font-normal"
            >
              <option value="">Select a Rating</option>
              {[1, 2, 3, 4, 5].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
            {errors.starRating && (
              <span className="text-red-500">{errors.starRating.message}</span>
            )}
          </label>
        </div>

        {/* Map */}
        <div className="flex-1">
          <label className="text-gray-700 text-sm font-bold block mb-1">
            Select Hotel Location on Map
          </label>
          <HotelMapPicker
            initialPosition={
              lat && lng ? { lat: Number(lat), lng: Number(lng) } : undefined
            }
            onLocationChange={({ lat, lng }) => {
              setValue("location.lat", lat, { shouldValidate: true });
              setValue("location.lng", lng, { shouldValidate: true });
            }}
          />

          {/* Hidden inputs to register location like other fields */}
          <input
            type="hidden"
            {...register("location.lat", {
              required: "This field is required",
              valueAsNumber: true,
            })}
          />
          <input
            type="hidden"
            {...register("location.lng", {
              required: "This field is required",
              valueAsNumber: true,
            })}
          />

          {errors.location?.lat && (
            <span className="text-red-500 text-sm font-bold">
              {errors.location.lat.message}
            </span>
          )}

          {typeof lat === "number" &&
            typeof lng === "number" &&
            !isNaN(lat) &&
            !isNaN(lng) && (
              <div className="flex text-gray-600 text-sm mt-2 items-center gap-2">
                <FaMapMarkerAlt className="text-red-500 text-lg" />
                <span>
                  Selected location: {toDMS(lat)} {lat >= 0 ? "N" : "S"},{" "}
                  {toDMS(lng)} {lng >= 0 ? "E" : "W"}
                </span>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default DetailsSection;
