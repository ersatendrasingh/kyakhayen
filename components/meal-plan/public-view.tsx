import Link from "next/link";
import Image from "next/image";
import Container from "@/components/container";
import { Button } from "@/components/ui/button";

const PublicView = () => {
  return (
    <section className="py-16 ">
      <Container>
        <div className="flex flex-col items-center text-center md:text-left justify-center">
          <h2 className="text-4xl text-websecondary mb-8">
            Welcome to Our Meal Planning Service
          </h2>
          <p className="text-lg text-center leading-loose tracking-wide mb-4">
            At Kya Khayen?, we understand the daily question of what to cook.
            Choose the cuisines and ingredients you enjoy, and discover
            personalized meal ideas that are practical for your routine.
          </p>

          <Link href="/auth/register">
            <Button
              variant="secondary"
              size="lg"
              className="bg-[#1e1a16] hover:bg-webprimary text-white rounded-full"
            >
              Join Kya Khayen?
            </Button>
          </Link>
          <Image
            src="/assets/images/meal-plan.webp"
            alt="personalized meal plan ideas"
            width={500}
            height={300}
            className="mb-6 rounded"
          />
          <div className="w-full flex flex-col items-center justify-center">
            <h3 className="text-4xl text-websecondary mb-8">
              Why Choose Our Meal Planning Service?
            </h3>
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/2 md:pr-4">
                <h4 className="text-xl font-medium text-websecondary mb-2">
                  Personalized Meal Plans
                </h4>
                <p className="text-lg tracking-wide text-justify leading-loose mb-4">
                  We create meal ideas based on your food preferences,
                  favourite cuisines and ingredients you want to avoid.
                </p>
                <h4 className="text-xl font-medium text-websecondary mb-2">
                  Nutritional Insights
                </h4>
                <p className="text-lg tracking-wide text-justify leading-loose mb-4">
                  Each recipe comes with a detailed breakdown of total calories,
                  carbohydrates, total fat, dietary fiber and protein to keep
                  recipe information clear.
                </p>

                <h4 className="text-xl font-medium text-websecondary mb-2">
                  Calorie and Nutrition Tracking
                </h4>
                <p className="text-lg tracking-wide text-justify leading-loose mb-4">
                  Know exactly what you're eating with our advanced calorie and
                  nutrition information. You can compare recipes while planning
                  your meals.
                </p>
              </div>
              <div className="md:w-1/2 md:pl-4">
                <h4 className="text-xl font-medium text-websecondary mb-2">
                  Recipe Customization
                </h4>
                <p className="text-lg tracking-wide text-justify leading-loose mb-4">
                  Explore a wide range of varieties of recipes to meet your
                  your tastes while keeping everyday cooking exciting and
                  flavorful.
                </p>

                <h4 className="text-xl font-medium text-websecondary mb-2">
                  Flexible Options
                </h4>
                <p className="text-lg tracking-wide text-justify leading-loose mb-4">
                  Whether you're vegan, keto, gluten-free, or just exploring new
                  cuisines, our meal plans adapt to your preferences .
                </p>
                <h4 className="text-xl font-medium text-websecondary mb-2">
                  Interactive Community
                </h4>
                <p className="text-lg tracking-wide text-justify leading-loose mb-4">
                  Join our vibrant community of lively meal enthusiasts and
                  share your culinary adventures with like-minded individuals
                  who are also passionate about cooking.
                </p>
              </div>
            </div>
          </div>
          <div className="w-full flex flex-col items-center justify-center mt-10">
            <h3 className="text-4xl text-websecondary mb-8">How It Works</h3>
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/2 md:pr-4">
                <h4 className="text-xl font-medium text-websecondary mb-2">
                  Step 1: Sign Up
                </h4>
                <p className="text-lg tracking-wide text-justify leading-loose mb-4">
                  Create an account with your email or your google account to
                  get started.
                </p>
                <h4 className="text-xl font-medium text-websecondary mb-2">
                  Step 2: Subscribe a Plan
                </h4>
                <p className="text-lg tracking-wide text-justify leading-loose mb-4">
                  Choose a subscription plan that fits your needs and unlock
                  premium features like customized recipes, nutrition tracking.
                </p>
              </div>
              <div className="md:w-1/2 md:pl-4">
                <h4 className="text-xl font-medium text-websecondary mb-2">
                  Step 3 : Complete Personalization
                </h4>
                <p className="text-lg tracking-wide text-justify leading-loose mb-4">
                  Share your food preferences, favourite cuisines and
                  ingredient exclusions. This helps us create a personalized
                  meal plan just for you.
                </p>
                <h4 className="text-xl font-medium text-websecondary mb-2">
                  Step 4: Access Your Meal Plan and Enjoy
                </h4>
                <p className="text-lg tracking-wide text-justify leading-loose mb-4">
                  Once you done personalization, Access your personalized meal
                  plan and start exploring new meal ideas today!
                </p>
              </div>
            </div>
            <div className="flex justify-center">
              <Link href="/auth/register">
                <Button
                  variant="secondary"
                  size="lg"
                  className="bg-[#1e1a16] hover:bg-webprimary text-white rounded-full"
                >
                  Join Kya Khayen?
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default PublicView;
