import { useEffect, useState } from 'react';

export const Tours = () => {
  const [tours, setTours] = useState('');

  useEffect(() => {
    const getAllTours = async () => {
      const tours = await fetch('/api/v1/tours');
      const response = await tours.json();
      console.table(response);
      setTours(response.data);
    };

    getAllTours();
  }, []);

  if (!tours) {
    return (
      <div>
        <h1>Loading...</h1>
      </div>
    );
  }

  return (
    <div>
      <h1>Hi there. We have {tours.length} tours for you</h1>
      {tours &&
        tours.map((tour) => (
          <div key={tour.id}>
            {/* <img src={tour.imageCover} alt={tour.name} /> */}
            <h2>{tour.name}</h2>
            <p>
              <b>Price:</b> ${tour.price}
            </p>
            <p>
              <b>Duration:</b> {tour.duration} days
            </p>
            <p>
              <b>Difficulty:</b> {tour.difficulty}
            </p>
            <p>
              <b>Date created:</b> {new Date(tour.createdAt).toDateString()}
            </p>
          </div>
        ))}
    </div>
  );
};
