import { useEffect, useState } from 'react';
import axios from 'axios';

export const Overview = () => {
  const [tours, setTours] = useState('');

  useEffect(() => {
    const getAllTours = async () => {
      const tours = await axios.get('api/v1/tours');
      console.log(tours.data.data);
      setTours(tours.data.data);
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
      <header class="header">
        <nav class="nav nav--tours">
          <a href="#" class="nav__el">
            All tours
          </a>
          <form class="nav__search">
            <button class="nav__search-btn">
              <svg></svg>
            </button>
            <input
              type="text"
              placeholder="Search tours"
              class="nav__search-input"
            />
          </form>
        </nav>
        <div class="header__logo">
          <img src="img/logo-white.png" alt="Natours logo" />
        </div>
        <nav class="nav nav--user">
          <a href="#" class="nav__el">
            My bookings
          </a>
          <a href="#" class="nav__el">
            <img src="img/user.jpg" alt="User photo" class="nav__user-img" />
            <span>Jonas</span>
          </a>

          <button class="nav__el nav__el--cta">Sign up</button>
        </nav>
      </header>

      <main class="main">
        <div class="card-container">
          <div class="card">
            <div class="card__header">
              <div class="card__picture">
                <div class="card__picture-overlay">&nbsp;</div>
                <img
                  src="img/tour-1-cover.jpg"
                  alt="Tour 1"
                  class="card__picture-img"
                />
              </div>

              <h3 class="heading-tertirary">
                <span>The Forest Hiker</span>
              </h3>
            </div>

            <div class="card__details">
              <h4 class="card__sub-heading">Easy 5-day tour</h4>
              <p class="card__text">
                Breathtaking hike through the Canadian Banff National Park
              </p>
              <div class="card__data">
                <svg class="card__icon"></svg>
                <span>Banff, Canada</span>
              </div>
              <div class="card__data">
                <svg class="card__icon"></svg>
                <span>April 2021</span>
              </div>
              <div class="card__data">
                <svg class="card__icon"></svg>
                <span>3 stops</span>
              </div>
              <div class="card__data">
                <svg class="card__icon"></svg>
                <span>25 people</span>
              </div>
            </div>

            <div class="card__footer">
              <p>
                <span class="card__footer-value">$297</span>
                <span class="card__footer-text">per person</span>
              </p>
              <p class="card__ratings">
                <span class="card__footer-value">4.9</span>
                <span class="card__footer-text">rating (21)</span>
              </p>
              <a href="#" class="btn btn--green btn--small">
                Details
              </a>
            </div>
          </div>
        </div>
      </main>

      <div class="footer">
        <div class="footer__logo">
          <img src="img/logo-green.png" alt="Natours logo" />
        </div>
        <ul class="footer__nav">
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
        <p class="footer__copyright">
          &copy; by Jonas Schmedtmann. All rights reserved.
        </p>
      </div>
    </div>
  );
};
