import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import './overview.scss';
import { useDispatch } from 'react-redux';
import { SET_TOURS } from '../../redux/tourSlice';

export default function Overview() {
  const [tours, setTours] = useState();
  const dispatch = useDispatch();

  useEffect(() => {
    const getAllTours = async () => {
      const tours = await axios.get('api/v1/tours');
      console.log(tours.data.data);
      setTours(tours.data.data);
      dispatch(SET_TOURS(tours.data.data));
    };

    getAllTours();
  }, [dispatch]);

  if (!tours) {
    return (
      <div className="loader">
        <ClipLoader
          color={'rgba(14, 16, 30, 0.937)'}
          // loading={loading}
          size={50}
        />
      </div>
    );
  }

  return (
    <>
      <main className="main">
        <div className="card-container">
          {tours.map((tour) => (
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
                    <span className="card__footer-text">per person</span>
                  </p>
                  <p className="card__ratings">
                    <span className="card__footer-value">
                      {tour.ratingsAverage}
                    </span>
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
      <div className="footer">
        <div className="footer__logo">
          <img src="img/logo-green.png" alt="Natours logo" />
        </div>
        <ul className="footer__nav">
          {/* <li>
        <a href="#">About us</a>
      </li>
      <li>
        <a href="#">Download apps</a>
      </li>
      <li>
        <a href="#">Become a guide</a>
      </li>
      <li>
        <a href="#">Careers</a>
      </li>
      <li>
        <a href="#">Contact</a>
      </li> */}
        </ul>
        <p className="footer__copyright">
          &copy; 2022 by Wisdom Elue. All rights reserved.
        </p>
      </div>
    </>
  );
}
