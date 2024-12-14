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
            At Kya Khayen?, we understand the importance of healthy living.
            Whether you're aiming to lose weight, gain muscle, or maintain your
            healthy lifestyle with a healthy and balanced diet, our main aim is
            to transform your eating habits and improve your overall well-being
            with our personalized healthy meal plans.
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
            alt="best diet plan for weight loss for female"
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
                  Say goodbye to generic diets! We create a meal plan based on
                  your food preferences, health goals, nutrition needs and your
                  body type.
                </p>
                <h4 className="text-xl font-medium text-websecondary mb-2">
                  Nutritional Insights
                </h4>
                <p className="text-lg tracking-wide text-justify leading-loose mb-4">
                  Each recipe comes with a detailed breakdown of total calories,
                  carbohydrates, total fat, dietary fiber, protein and health
                  benefits to keep you informed and motivated.
                </p>

                <h4 className="text-xl font-medium text-websecondary mb-2">
                  Calorie and Nutrition Tracking
                </h4>
                <p className="text-lg tracking-wide text-justify leading-loose mb-4">
                  Know exactly what you're eating with our advanced calorie and
                  nutrition tracking features. You can monitor your daily intake
                  and progress towards your goals.
                </p>
              </div>
              <div className="md:w-1/2 md:pl-4">
                <h4 className="text-xl font-medium text-websecondary mb-2">
                  Recipe Customization
                </h4>
                <p className="text-lg tracking-wide text-justify leading-loose mb-4">
                  Explore a wide range of varieties of recipes to meet your
                  specific nutritional needs while keeping your healthy meals
                  exciting and flavorful.
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
                  who are also passionate about healthy living.
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
                  Share your dietary preferences, health goals and some basic
                  information about your body. This helps us create a
                  personalized meal plan just for you.
                </p>
                <h4 className="text-xl font-medium text-websecondary mb-2">
                  Step 4: Access Your Meal Plan and Enjoy
                </h4>
                <p className="text-lg tracking-wide text-justify leading-loose mb-4">
                  Once you done personalization, Access your personalized meal
                  plan and start your journey to a healthy lifestyle today!
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
