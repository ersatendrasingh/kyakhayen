import { useParams } from "react-router-dom";

const useCourseId = () => {
  const { courseId } = useParams();

  return courseId;
};

export default useCourseId;
