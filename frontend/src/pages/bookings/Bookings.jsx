import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { getUser } from '../../redux/authSlice';
import { Link } from 'react-router-dom';
import { HashLoader } from 'react-spinners';

export default function Bookings() {
  const [bookings, setBookings] = useState();
  const user = useSelector(getUser);
  //   console.log(user);

  useEffect(() => {
    const getBookings = async () => {
      const { data } = await axios.get('api/v1/bookings/my-bookings');
      setBookings(data.data);
      console.log(data.data);
    };

    getBookings();
  }, []);

  if (!bookings) {
    return (
      <div className="loader">
        <HashLoader color={'rgba(14, 16, 30, 0.937)'} size={50} />
      </div>
    );
  }

  return (
    <div>
      {bookings.length === 0 ? (
        <>
          <h1>Hi, {user.name.split(' ')[1]}</h1>
          <h1>You do not have any bookings yet</h1>
        </>
      ) : (
        <>
          <h1>Hi, {user.name.split(' ')[1]}</h1>
          <h1>
            You currently have {bookings.length}{' '}
            {bookings.length === 1 ? 'booking' : 'bookings'}
          </h1>
          <main className="main">
            <div className="card-container">
              {bookings.map((tour) => (
                <div key={tour._id}>
                  <div className="card">
                    <div className="card__header">
                      <div className="card__picture">
                        <div className="card__picture-overlay">&nbsp;</div>
                        <img
                          src={`../../img/tours/${tour.imageCover}`}
                          alt={tour.name}
                          className="card__picture-img"
                        />
                      </div>

                      <h3 className="heading-tertirary">
                        <span>{tour.name}</span>
                      </h3>
                    </div>

                    <div className="card__details">
                      <h4 className="card__sub-heading">
                        {tour.difficulty} {tour.duration}-day tour
                      </h4>
                      <p className="card__text">{tour.summary}</p>
                      <div className="card__data">
                        <svg className="card__icon"></svg>
                        <span>{tour.startLocation.description}</span>
                      </div>
                      <div className="card__data">
                        <svg className="card__icon"></svg>
                        <span>
                          {tour.startDates[0].toLocaleString('en-us', {
                            month: 'long',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className="card__data">
                        <svg className="card__icon"></svg>
                        <span>{tour.locations.length} stops</span>
                      </div>
                      <div className="card__data">
                        <svg className="card__icon"></svg>
                        <span>{tour.maxGroupSize} people</span>
                      </div>
                    </div>

                    <div className="card__footer">
                      <p>
                        <span className="card__footer-value">{tour.price}</span>
                        &nbsp;
                        <span className="card__footer-text">per person</span>
                      </p>
                      <p className="card__ratings">
                        <span className="card__footer-value">
                          {tour.ratingsAverage}
                        </span>
                        &nbsp;
                        <span className="card__footer-text">
                          rating ({tour.ratingsQuantity})
                        </span>
                      </p>
                      <Link
                        to={`/${tour._id}`}
                        className="btn btn--green btn--small"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </>
      )}
    </div>
  );
}
