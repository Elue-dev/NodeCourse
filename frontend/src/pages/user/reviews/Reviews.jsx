import axios from 'axios';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { HashLoader } from 'react-spinners';
import { getUser } from '../../../redux/authSlice';
import { SET_REVIEWS } from '../../../redux/reviewSlice';
import { getTours } from '../../../redux/tourSlice';

export default function Reviews() {
  const [reviews, setReviews] = useState();
  const dispatch = useDispatch();
  const user = useSelector(getUser);
  const tours = useSelector(getTours);

  useEffect(() => {
    const getReviews = async () => {
      const { data } = await axios.get('api/v1/reviews');
      setReviews(data.data);
      dispatch(SET_REVIEWS(data.data));
    };

    getReviews();
  }, [dispatch]);

  const userReviews = reviews?.filter((rev) => rev.user._id === user._id);
  console.log(userReviews);

  const reviewIds = [];

  userReviews?.map((rev) => reviewIds.push(rev.tour));

  const tour = tours.filter((tour) => reviewIds.includes(tour.id));
  console.log(tour);

  if (!reviews) {
    return (
      <div className="loader">
        <HashLoader color={'rgba(14, 16, 30, 0.937)'} size={50} />
      </div>
    );
  }

  return (
    <div>
      {userReviews?.length === 0 ? (
        <h1>You have not made any reviews on any tour</h1>
      ) : (
        <>
          <h1>
            You have {userReviews?.length}{' '}
            {userReviews?.length === 1 ? 'review' : 'reviews'}
          </h1>
          <h1>Tours:</h1>
          {tour.map((t) => (
            <h2 key={t.id}>{t.name} tour</h2>
          ))}

          <h1>Reviews:</h1>
          {userReviews.map((rev) => (
            <h2 key={rev.id}>
              {rev.review} ({rev.rating} rating)
            </h2>
          ))}
          {/* 
          <table>
            <thead>
              <tr>
                {tour.map((t) => (
                  <th key={t.id}>{t.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {userReviews.map((rev) => (
                <td key={rev.id}>
                  {rev.review} ({rev.rating} rating)
                </td>
              ))}
            </tbody>
          </table> */}
        </>
      )}
    </div>
  );
}
