import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-5 text-center">
      <div>
        <h1 className="text-6xl font-semibold">404</h1>
        <p className="mt-3 text-mute">This page does not exist. · ይህ ገጽ የለም።</p>
        <Link href="/" className="btn btn-primary mt-6">Home</Link>
      </div>
    </main>
  );
}
