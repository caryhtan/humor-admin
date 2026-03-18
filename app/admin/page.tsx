"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

const cards = [
  { href: "/admin/users", title: "Users", description: "Read profiles" },
  { href: "/admin/images", title: "Images", description: "Create, read, update, delete images" },
  { href: "/admin/captions", title: "Captions", description: "Read captions" },
  { href: "/admin/humor-flavors", title: "Humor Flavors", description: "Read humor flavors" },
  { href: "/admin/humor-flavor-steps", title: "Humor Flavor Steps", description: "Read humor flavor steps" },
  { href: "/admin/humor-mix", title: "Humor Mix", description: "Read and update humor mix" },
  { href: "/admin/caption-requests", title: "Caption Requests", description: "Read caption requests" },
  { href: "/admin/llm-prompt-chains", title: "LLM Prompt Chains", description: "Read llm prompt chains" },
  { href: "/admin/llm-model-responses", title: "LLM Responses", description: "Read llm responses" },
  { href: "/admin/terms", title: "Terms", description: "Create, read, update, delete terms" },
  { href: "/admin/caption-examples", title: "Caption Examples", description: "Create, read, update, delete caption examples" },
  { href: "/admin/llm-models", title: "LLM Models", description: "Create, read, update, delete llm models" },
  { href: "/admin/llm-providers", title: "LLM Providers", description: "Create, read, update, delete llm providers" },
  { href: "/admin/allowed-signup-domains", title: "Allowed Signup Domains", description: "Create, read, update, delete allowed signup domains" },
  { href: "/admin/whitelist-email-addresses", title: "Whitelisted Emails", description: "Create, read, update, delete whitelisted e-mail addresses" },
];

export default function AdminPage() {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">Humor Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-black text-white px-4 py-2 rounded-xl"
          >
            Log out
          </button>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {cards.map((card) => (
            <Link key={card.href} href={card.href} className="block">
              <div className="bg-white rounded-2xl shadow p-6 hover:shadow-lg transition">
                <h2 className="text-xl font-semibold mb-2">{card.title}</h2>
                <p className="text-gray-600">{card.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}