import { useEffect } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { HotelFormData } from "./ManageHotelForm";
import { UseAppContext } from "../../contexts/AppContext";
import { FiTrash } from "react-icons/fi";

const RoomTypesSection = () => {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<HotelFormData>();

  const { showToast } = UseAppContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "roomTypes",
  });

  const roomTypes = useWatch({ control, name: "roomTypes" });

  useEffect(() => {
    if (!roomTypes || roomTypes.length === 0) {
      append({ name: "", price: 0, adults: 1, children: 0, totalRooms: 1 });
    }
  }, [roomTypes, append]);

  const handleAdd = () => {
    const last = roomTypes?.[roomTypes.length - 1];

    if (last && !last.name?.trim()) {
      showToast({
        message: "Complete the room name before adding another",
        type: "ERROR",
      });
      return;
    }

    append({ name: "", price: 0, adults: 1, children: 0, totalRooms: 1 });
  };

  const handleRemove = (index: number) => {
    if (fields.length === 1 || index === 0) {
      showToast({
        message: "At least one room type is required.",
        type: "ERROR",
      });
      return;
    }

    remove(index);
  };

  return (
    <div className="space-y-4 bg-blue-100 p-6 rounded-xl shadow-md border border-gray-200">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Room types</h2>
        <button
          type="button"
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
        >
          Add room type
        </button>
      </div>

      {fields.map((field, index) => (
        <div
          key={field.id}
          className="relative grid grid-cols-1 md:grid-cols-5 gap-4 border p-4 rounded bg-gray-50"
        >
          {fields.length > 1 && index !== 0 && (
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="absolute top-3 right-4 flex items-center gap-1 text-red-500 hover:text-red-700 text-sm"
              title="Delete room type"
            >
              <FiTrash size={16} />
            </button>
          )}

          {/* Room Name */}
          <div className="flex flex-col mt-2">
            <label className="font-medium text-sm mb-1">Room name</label>
            <input
              {...register(`roomTypes.${index}.name`, {
                required: "Room type name is required",
              })}
              placeholder="Ex: Double Room"
              className="p-2 border rounded"
            />
            {errors.roomTypes?.[index]?.name && (
              <span className="text-red-500 font-bold text-sm mt-1">
                {errors.roomTypes[index]?.name?.message}
              </span>
            )}
          </div>

          {/* Price */}
          <div className="flex flex-col mt-2">
            <label className="font-medium text-sm mb-1">Price / night</label>
            <input
              type="number"
              {...register(`roomTypes.${index}.price`, {
                valueAsNumber: true,
                validate: (value) =>
                  value > 0 || "Price should be greater than 0",
              })}
              className="p-2 border rounded"
              defaultValue={0}
            />
            {errors.roomTypes?.[index]?.price && (
              <span className="text-red-500 font-bold text-sm mt-1">
                {errors.roomTypes[index]?.price?.message}
              </span>
            )}
          </div>

          {/* Adults */}
          <div className="flex flex-col mt-2">
            <label className="font-medium text-sm mb-1">Adults</label>
            <input
              type="number"
              {...register(`roomTypes.${index}.adults`, {
                valueAsNumber: true,
              })}
              className="p-2 border rounded"
              defaultValue={1}
            />
          </div>

          {/* Children */}
          <div className="flex flex-col mt-2">
            <label className="font-medium text-sm mb-1">Children</label>
            <input
              type="number"
              {...register(`roomTypes.${index}.children`, {
                valueAsNumber: true,
              })}
              className="p-2 border rounded"
              defaultValue={0}
            />
          </div>

          {/* Total rooms */}
          <div className="flex flex-col mt-2">
            <label className="font-medium text-sm mb-1">Number of rooms</label>
            <input
              type="number"
              {...register(`roomTypes.${index}.totalRooms`, {
                valueAsNumber: true,
              })}
              className="p-2 border rounded"
              defaultValue={1}
            />
          </div>
        </div>
      ))}

      {/* Form-level check: At least one room has name + price > 0 */}
      <input
        type="hidden"
        {...register("roomTypes", {
          validate: (roomTypes) => {
            if (!roomTypes || roomTypes.length === 0) {
              return "At least one room type is required";
            }

            const valid = roomTypes.some(
              (room) =>
                room.name?.trim() &&
                typeof room.price === "number" &&
                room.price > 0
            );

            return valid || "At least one room type is required";
          },
        })}
      />

      {typeof errors.roomTypes?.message === "string" && (
        <p className="text-red-600 text-sm font-medium mt-1">
          {errors.roomTypes.message}
        </p>
      )}
    </div>
  );
};

export default RoomTypesSection;
