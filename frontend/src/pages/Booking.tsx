import { useQuery } from "@tanstack/react-query";
import * as apiClient from "../api-client";
import BookingForm from "../forms/BookingForm/BookingForm";
import { UseSearchContext } from "../contexts/SearchContext";
import { useLocation, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import BookingDetailsSummary from "../components/BookingDetailsSummary";
import { Elements } from "@stripe/react-stripe-js";
import { UseAppContext } from "../contexts/AppContext";

const Booking = () => {
  const search = UseSearchContext();
  const { hotelId } = useParams();
  const { stripePromise } = UseAppContext();

  const [numberOfNights, setNumberOfNights] = useState<number>(0);
  const [roomTypeName, setRoomTypeName] = useState<string>("");

  const location = useLocation();
  const state = location.state as {
    selectedRoom?: { name: string; price: number };
    roomTypeName?: string;
    nights?: number;
  };

  console.log("Booking state", state.selectedRoom?.name);

  useEffect(() => {
    if (state?.roomTypeName) {
      setRoomTypeName(state.roomTypeName);
    } else if (state?.selectedRoom?.name) {
      setRoomTypeName(state.selectedRoom.name); // fallback
    }

    if (state?.nights) {
      setNumberOfNights(state.nights);
    }
  }, [state]);

  // useEffect(() => {
  //   if (search.checkIn && search.checkOut) {
  //     const nights =
  //       Math.abs(search.checkOut.getTime() - search.checkIn.getTime()) /
  //       (1000 * 60 * 60 * 24);
  //     setNumberOfNights(Math.ceil(nights));
  //   }
  // }, [search.checkIn, search.checkOut]);

  const { data: paymentIntentData } = useQuery({
    queryKey: ["createPaymentIntent"],
    queryFn: () =>
      apiClient.createPaymentIntent(
        hotelId as string,
        numberOfNights.toString(),
        roomTypeName.toString()
      ),
    enabled: !!hotelId && numberOfNights > 0,
  });

  const { data: hotel } = useQuery({
    queryKey: ["fetchHotelById"],
    queryFn: () => apiClient.fetchHotelById(hotelId as string),
    enabled: !!hotelId,
  });

  const { data: currentUser } = useQuery({
    queryKey: ["fetchCurrentUser"],
    queryFn: apiClient.fetchCurrentUser,
  });

  if (!hotel) {
    return <></>;
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 md:px-8 lg:px-12">
      <div className="grid md:grid-cols-[1fr_2fr]  ">
        <BookingDetailsSummary
          checkIn={search.checkIn}
          checkOut={search.checkOut}
          adultCount={search.adultCount}
          childCount={search.childCount}
          numberOfNights={numberOfNights}
          hotel={hotel}
        />
        {currentUser && paymentIntentData && (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret: paymentIntentData.clientSecret,
            }}
          >
            <BookingForm
              currentUser={currentUser}
              paymentIntent={paymentIntentData}
              roomTypeName={roomTypeName}
            />
          </Elements>
        )}
      </div>
    </div>
  );
};

export default Booking;
