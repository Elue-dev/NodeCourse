import axios from 'axios';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { BeatLoader, HashLoader } from 'react-spinners';
import { getUser } from '../../redux/authSlice';

export default function TourDetail() {
  const [tour, setTour] = useState();
  const [loading, setLoading] = useState(false);
  const { id } = useParams();
  const user = useSelector(getUser);

  useEffect(() => {
    const getTour = async () => {
      const singleTour = await axios.get(`api/v1/tours/${id}`);
      setTour(singleTour.data.data);
    };

    getTour();
  }, [id]);

  const createBooking = async () => {
    try {
      const { data } = await axios.post(
        `/api/v1/bookings/save-booking/${id}/${user._id}/${tour.price}`
      );
      console.log(data);
    } catch (error) {
      console.log(error);
    }
  };

  const bookTour = async () => {
    setLoading(true);

    try {
      const { data } = await axios(`/api/v1/bookings/checkout-session/${id}`);
      console.log(data);
      if (data.status === 'success') {
        createBooking();
        setTimeout(() => (window.location.href = data.session.url), 3000);
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  if (!tour) {
    return (
      <div className="loader">
        <HashLoader color={'rgba(14, 16, 30, 0.937)'} size={50} />
      </div>
    );
  }

  const format_date = (x) => {
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    let date = new Date(x);
    // let month = date.getMonth() + 1;
    return (
      monthNames[date.getMonth()] +
      ' ' +
      date.getDate() +
      ', ' +
      date.getFullYear()
    );
  };

  const paragraphs = tour.description.split('\n');

  return (
    <>
      <section className="section-header">
        <div className="header__hero">
          <div className="header__hero-overlay"></div>
          <img
            src={`../../img/tours/${tour.imageCover}`}
            alt={tour.name}
            className="header__hero-img"
          />
        </div>
        <div className="heading-box">
          <h1 className="heading-primary">
            <span>{tour.name} tour</span>
          </h1>
          <div className="heading-box__group">
            <div className="heading-box__detail">
              <svg className="heading-box__icon"></svg>
              <span className="heading-box__text">{tour.duration} days</span>
            </div>
            <div className="heading-box__detail">
              <svg className="heading-box__icon"></svg>
              <span className="heading-box__text">
                {tour.startLocation.description} days
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="section-description">
        <div className="overview-box">
          <div>
            <div className="overview-box__group">
              <h2 className="heading-secondary ma-bt-lg">Quick facts</h2>
              <h2>Next date: {format_date(tour.startDates[0])}</h2>
              <br />
              <h2>Difficulty: {tour.difficulty}</h2>
              <br />
              <h2>Participants: {tour.maxGroupSize} people</h2>
              <br />

              <h2>Average Rating: {tour.ratingsAverage} / 5</h2>
            </div>
            <div className="overview-box__group">
              <h2 className="heading-secondary ma-bt-lg">Your tour guides</h2>

              {tour?.guides.map((guide, index) => (
                <div className="overview-box__detail" key={index}>
                  <img
                    src={`../../img/users/${guide.photo}`}
                    alt={guide.name}
                    className="overview-box__img"
                  />

                  {guide.role === 'lead-guide' ? (
                    <span className="overview-box__label">lead guide</span>
                  ) : (
                    <span className="overview-box__label">Tour guide</span>
                  )}

                  <span className="overview-box__text">{guide.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="description-box">
          <h2 className="heading-secondary ma-bt-lg">About {tour.name} tour</h2>
          {paragraphs.map((p, index) => (
            <p className="description__text" key={index}>
              {p}
            </p>
          ))}
        </div>
      </section>

      <section className="section-pictures">
        {tour.images.map((img, index) => (
          <div className="picture-box" key={index}>
            <img
              src={`../../img/tours/${img}`}
              alt={`tour.name ${index + 1}`}
              className={`picture-box__img picture-box__img--${index + 1}`}
            />
          </div>
        ))}
      </section>

      <section className="section-reviews">
        <div className="reviews">
          {tour.reviews.map((review, index) => (
            <div className="reviews__card" key={index}>
              <div className="reviews__avatar">
                <img
                  src={`../../img/users/${review.user?.photo}`}
                  alt={review.user?.name}
                  className="reviews__avatar-img"
                />
                <h6 className="reviews__user">{review.user?.name}</h6>
              </div>
              <p className="reviews__text">{review.review}</p>
              {/* use react star rating here */}

              <div className="reviews__rating">
                <h1>{review.rating} / 5</h1>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section-cta">
        <div className="cta">
          <div className="cta__img cta__img--logo">
            <img src="/img/logo-white.png" alt="Natours logo" />
          </div>
          <img
            src={`../../img/tours/${tour.images[1]}`}
            alt="Tour"
            className="cta__img cta__img--1"
          />
          <img
            src={`../../img/tours/${tour.images[2]}`}
            alt="Tour"
            className="cta__img cta__img--2"
          />
          <div className="cta__content">
            <h2 className="heading-secondary"> What are you waiting for?</h2>
            <p className="cta__text">
              {tour.duration} days. 1 adventure. Infinite memories. Make it
              yours today!
            </p>

            {user ? (
              <>
                {loading ? (
                  <button
                    onClick={bookTour}
                    className="btn btn--green span-all-rows"
                    disabled
                  >
                    <BeatLoader loading={loading} size={10} color={'#fff'} />
                  </button>
                ) : (
                  <button
                    onClick={bookTour}
                    className="btn btn--green span-all-rows"
                  >
                    Book tour now!
                  </button>
                )}
              </>
            ) : (
              <button className="btn btn--green span-all-rows">
                <Link to="/login">Log in to book tour!</Link>
              </button>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
