import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Property } from './../../../types/property'

export const CheckoutPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    const [property, setProperty] = useState<Property | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const bookingId = (location.state as any)?.bookingId;
    
    const {
        checkIn = "",
        checkOut = "",
        guestsCount = 1
    } = (location.state as any) || {};

    useEffect(() => {
  setLoading(true);
  setError(null);
  fetch(`http://localhost:3000/api/v1/listnings/${id}`)
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then(data => {
      const listning = data.data || data;
      setProperty({
        ...listning,
        _id: listning._id || listning.id,
        pricePerNight: listning.price ?? listning.pricePerNight ?? 0,
        location: listning.location || 'Sverige',
        guests: listning.guests ?? 1,
        bedrooms: listning.bedrooms ?? 0,
        bathrooms: listning.bathrooms ?? 0,
        category: listning.propertyType || listning.category || 'Lägenhet',
        rating: listning.rating ?? 4.5,
        reviewsCount: listning.reviewsCount ?? 0,
        images: listning.images || [],
      } as Property);
    })
    .catch(err => {
      console.error('Error fetching listing:', err);
      setError('Kunde inte hämta bokningsuppgifter. Försök igen senare.');
    })
    .finally(() => setLoading(false));
}, [id]);

    //match Processing calculations
    const start = checkIn ? new Date(checkIn) : null;
    const end = checkOut ? new Date(checkOut) : null;
    const totalNights =
        start && end && end > start
            ? Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
            : 0;
    const rawBasePrice =
        property && totalNights > 0
            ? totalNights * property.pricePerNight
            : 0;

    const serviceFee =
        rawBasePrice > 0
            ? Math.round(rawBasePrice * 0.1)
            : 0;

    const totalFinalPrice = rawBasePrice + serviceFee;


    if (loading) return <div className="text-center py-20 text-gray-500">Laddar checkout...</div>;
    if (error) return <div className="text-center py-20 text-red-500">{error}</div>;
    if (!property) return <div className="text-center py-20 text-gray-500">Bokningen kunde inte hämtas.</div>;
    if (!checkIn || !checkOut) return <div className="text-center py-20 text-gray-500">Saknar bokningsdata</div>;



    // const handlePayment = async () => {
    //     try {
    //         alert('Betalning genomförd!');
    //         navigate("/payment-success");
    //     } catch (error) {
    //         console.error('Betalningsfel:', error);
    //     }
    // };
   const handlePayment = async () => {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(
      `http://localhost:3000/api/v1/bookings/${bookingId}/pay`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message);
    }

    navigate("/payment-success");

  } catch (error) {
    console.error("Payment error:", error);
  }
};


    return (
        <div className="max-w-3xl mx-auto px-6 py-12">
            <div className="bg-white rounded-2xl shadow-md p-8">
                <h1 className="text-3xl font-bold mb-6">
                    Checkout
                </h1>

                <div className="space-y-4">
                    <p className="text-gray-600">
                        Fastighets-ID:
                    </p>

                    <div className="bg-gray-100 p-4 rounded-lg break-all">
                        {id}
                    </div>

                    <div className="border-t pt-6">
                        <h2 className="text-xl font-semibold mb-4">
                            Betalningsöversikt
                        </h2>

                        <div className="flex justify-between py-2">
                            <span>Bokning pris</span>
                            <span>{rawBasePrice} kr</span>
                        </div>

                        <div className="flex justify-between py-2">
                            <span>Serviceavgift (10%)</span>
                            <span>{serviceFee} kr</span>
                        </div>

                        <div className="flex justify-between py-2 font-bold text-lg border-t mt-2 pt-2">
                            <span>Totalt</span>
                            <span>{totalFinalPrice} kr</span>
                        </div>
                    </div>

                    <button
                        onClick={handlePayment}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition"
                    >
                        Bekräfta betalning
                    </button>
                </div>
            </div>
        </div>
    );
};