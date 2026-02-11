export function Hero() {
  return (
    <div className="flex flex-col gap-16 items-center">
      <h1 className="text-4xl font-bold text-center">Welcome to Adashi</h1>
      <p className="text-2xl lg:text-3xl !leading-tight mx-auto max-w-2xl text-center">
        A modern dashboard application built with Next.js and Supabase
      </p>
      <div className="w-full p-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent my-8" />
    </div>
  );
}
