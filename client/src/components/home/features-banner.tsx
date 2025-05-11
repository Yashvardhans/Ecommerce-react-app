const features = [
  {
    icon: "fas fa-truck",
    title: "Free Shipping",
    description: "On orders over $50"
  },
  {
    icon: "fas fa-undo",
    title: "Easy Returns",
    description: "30-day return policy"
  },
  {
    icon: "fas fa-lock",
    title: "Secure Payment",
    description: "Safe & encrypted"
  },
  {
    icon: "fas fa-headset",
    title: "24/7 Support",
    description: "Dedicated support"
  }
];

const FeaturesBanner = () => {
  return (
    <section className="py-8 bg-neutral-lightest">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white p-4 rounded-lg shadow-sm flex flex-col items-center text-center"
            >
              <div className="text-primary text-3xl mb-2">
                <i className={feature.icon}></i>
              </div>
              <h3 className="font-medium text-neutral-dark mb-1">{feature.title}</h3>
              <p className="text-sm text-neutral-dark">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesBanner;
