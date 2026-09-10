"use client";

import { useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api-client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { SessionUser } from "@/lib/session";
import { LogoutButton } from "@/components/dashboard/LogoutButton";

type Section = "overview" | "orders" | "wishlist" | "addresses" | "profile" | "notifications" | "settings";
type Address = { _id: string; label: string; fullName: string; phone: string; addressLine: string; city: string; area: string; postalCode?: string; isDefault: boolean };
type AddressForm = { label: string; fullName: string; phone: string; addressLine: string; city: string; area: string; postalCode: string };
type Order = { _id: string; total: number; status: string; paymentStatus: string; createdAt: string; items: { name: string; quantity: number }[] };
type WishlistItem = { product?: { name: string; slug: string; price: number }; priceWhenAdded: number; addedAt: string };

const sections: { label: string; value: Section }[] = [
  { label: "Overview", value: "overview" },
  { label: "Orders", value: "orders" },
  { label: "Wishlist", value: "wishlist" },
  { label: "Addresses", value: "addresses" },
  { label: "Profile", value: "profile" },
  { label: "Notifications", value: "notifications" },
  { label: "Settings", value: "settings" },
];

function money(value: number) {
  return `৳${value.toLocaleString("en-BD")}`;
}

export function AccountClient({ user, initialSection }: { user: SessionUser; initialSection: Section }) {
  const [section, setSection] = useState(initialSection);
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [wishlist, setWishlist] = useState<WishlistItem[] | null>(null);
  const [addresses, setAddresses] = useState<Address[] | null>(null);
  const [message, setMessage] = useState("");
  const [profile, setProfile] = useState({ name: user.name, phone: "" });
  const [address, setAddress] = useState<AddressForm>({ label: "Home", fullName: user.name, phone: "", addressLine: "", city: "Dhaka", area: "", postalCode: "" });

  function navigate(next: Section) {
    setSection(next);
    setMessage("");
    window.history.replaceState(null, "", next === "overview" ? "/account" : `/account?section=${next}`);
    if (next === "orders" && orders === null) apiFetch<{ orders: Order[] }>("/orders/me").then((data) => setOrders(data.orders)).catch(() => setMessage("Orders could not be loaded."));
    if (next === "wishlist" && wishlist === null) apiFetch<{ wishlist: WishlistItem[] }>("/account/wishlist").then((data) => setWishlist(data.wishlist)).catch(() => setMessage("Wishlist could not be loaded."));
    if (next === "addresses" && addresses === null) apiFetch<{ addresses: Address[] }>("/account/addresses").then((data) => setAddresses(data.addresses)).catch(() => setMessage("Addresses could not be loaded."));
  }

  async function saveProfile(event: React.FormEvent) {
    event.preventDefault();
    try { await apiFetch("/account/profile", { method: "PATCH", body: JSON.stringify(profile) }); setMessage("Profile updated."); }
    catch { setMessage("Profile could not be updated."); }
  }

  async function addAddress(event: React.FormEvent) {
    event.preventDefault();
    try { const data = await apiFetch<{ addresses: Address[] }>("/account/addresses", { method: "POST", body: JSON.stringify({ ...address, isDefault: !addresses?.length }) }); setAddresses(data.addresses); setMessage("Address saved."); setAddress({ ...address, area: "", addressLine: "", phone: "", postalCode: "" }); }
    catch { setMessage("Address could not be saved."); }
  }

  async function removeAddress(id: string) {
    try { const data = await apiFetch<{ addresses: Address[] }>(`/account/addresses/${id}`, { method: "DELETE" }); setAddresses(data.addresses); setMessage("Address removed."); }
    catch { setMessage("Address could not be removed."); }
  }

  return (
    <div className="grid grid-cols-1 gap-10 py-12 md:grid-cols-4">
      <aside>
        <p className="label-caps mb-1">Welcome back</p>
        <h1 className="mb-6 font-display text-h2">My Account</h1>
        <nav className="flex flex-col gap-1" aria-label="Account sections">
          {sections.map((item) => <button key={item.value} onClick={() => navigate(item.value)} className={`px-3 py-2 text-left text-caption ${section === item.value ? "bg-ink text-ivory" : "text-ink hover:bg-sand/60"}`}>{item.label}</button>)}
        </nav>
        <LogoutButton />
      </aside>
      <main className="md:col-span-3">
        {message && <p className="mb-6 border border-sand bg-paper px-4 py-3 text-caption">{message}</p>}
        {section === "overview" && <Overview user={user} navigate={navigate} />}
        {section === "orders" && <Orders orders={orders} />}
        {section === "wishlist" && <Wishlist wishlist={wishlist} />}
        {section === "addresses" && <Addresses addresses={addresses} address={address} setAddress={setAddress} addAddress={addAddress} removeAddress={removeAddress} />}
        {section === "profile" && <Profile profile={profile} setProfile={setProfile} saveProfile={saveProfile} user={user} />}
        {section === "notifications" && <Preferences title="Notifications" copy="Choose the updates you want to receive from MAISON." options={["Order updates", "New collection releases", "Price drops on saved items"]} />}
        {section === "settings" && <Preferences title="Settings" copy="Your account preferences are ready to customize." options={["Keep me signed in", "Show prices in BDT", "Use my default address at checkout"]} />}
      </main>
    </div>
  );
}

function Overview({ user, navigate }: { user: SessionUser; navigate: (section: Section) => void }) {
  return <><div className="mb-8"><p className="text-body text-charcoal">Signed in as <span className="text-ink">{user.name}</span> ({user.email})</p></div><div className="grid grid-cols-1 gap-4 sm:grid-cols-3">{["Orders", "Wishlist", "Addresses"].map((label) => <button key={label} onClick={() => navigate(label.toLowerCase() as Section)} className="border border-sand p-5 text-left hover:bg-paper"><p className="label-caps mb-2">{label}</p><p className="text-caption text-stone">View your {label.toLowerCase()}</p></button>)}</div></>;
}

function Orders({ orders }: { orders: Order[] | null }) {
  if (!orders) return <p className="text-body text-stone">Loading orders...</p>;
  return <SectionFrame title="Orders" copy="Track your recent purchases and payment status.">{orders.length ? <div className="space-y-3">{orders.map((order) => <div key={order._id} className="flex flex-col gap-2 border border-sand p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-medium">Order #{order._id.slice(-8).toUpperCase()}</p><p className="text-caption text-stone">{new Date(order.createdAt).toLocaleDateString()} · {order.items.length} item(s)</p></div><div className="text-left sm:text-right"><p className="font-medium">{money(order.total)}</p><p className="text-caption capitalize text-stone">{order.status} · {order.paymentStatus}</p></div></div>)}</div> : <Empty copy="You have not placed an order yet." href="/shop/all" label="Explore the shop" />}</SectionFrame>;
}

function Wishlist({ wishlist }: { wishlist: WishlistItem[] | null }) {
  if (!wishlist) return <p className="text-body text-stone">Loading wishlist...</p>;
  return <SectionFrame title="Wishlist" copy="Keep an eye on pieces you want to come back to.">{wishlist.length ? <div className="space-y-3">{wishlist.map((item, index) => <div key={`${item.addedAt}-${index}`} className="flex items-center justify-between border border-sand p-4"><div><p className="font-medium">{item.product?.name ?? "Unavailable product"}</p><p className="text-caption text-stone">Added {new Date(item.addedAt).toLocaleDateString()}</p></div>{item.product && <Link className="text-caption underline" href={`/product/${item.product.slug}`}>{money(item.product.price)}</Link>}</div>)}</div> : <Empty copy="Your wishlist is waiting for something special." href="/shop/all" label="Explore the shop" />}</SectionFrame>;
}

function Addresses({ addresses, address, setAddress, addAddress, removeAddress }: { addresses: Address[] | null; address: AddressForm; setAddress: (value: AddressForm) => void; addAddress: (event: React.FormEvent) => void; removeAddress: (id: string) => void }) {
  const fields: { name: keyof AddressForm; label: string }[] = [{ name: "label", label: "Label" }, { name: "fullName", label: "Full name" }, { name: "phone", label: "Phone" }, { name: "addressLine", label: "Address" }, { name: "area", label: "Area" }, { name: "city", label: "City" }, { name: "postalCode", label: "Postal code" }];
  return <SectionFrame title="Addresses" copy="Save delivery details for a quicker checkout."><div className="mb-8 grid gap-3">{addresses?.map((item) => <div key={item._id} className="flex justify-between border border-sand p-4"><div><p className="font-medium">{item.label} {item.isDefault && <span className="label-caps ml-2">Default</span>}</p><p className="text-caption text-stone">{item.fullName}, {item.addressLine}, {item.area}, {item.city}</p><p className="text-caption text-stone">{item.phone}</p></div><button onClick={() => removeAddress(item._id)} className="text-caption underline">Remove</button></div>)}</div><form onSubmit={addAddress} className="grid gap-4 sm:grid-cols-2">{fields.map(({ name, label }) => <Input key={name} label={label} value={address[name]} onChange={(event) => setAddress({ ...address, [name]: event.target.value })} required={name !== "postalCode"} />)}<Button type="submit" className="sm:col-span-2">Save address</Button></form></SectionFrame>;
}

function Profile({ profile, setProfile, saveProfile, user }: { profile: { name: string; phone: string }; setProfile: (value: { name: string; phone: string }) => void; saveProfile: (event: React.FormEvent) => void; user: SessionUser }) {
  return <SectionFrame title="Profile" copy="Keep your personal details current."><form onSubmit={saveProfile} className="max-w-md space-y-4"><Input label="Name" value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} required /><Input label="Email" value={user.email} disabled /><Input label="Phone" value={profile.phone} onChange={(event) => setProfile({ ...profile, phone: event.target.value })} placeholder="01XXXXXXXXX" /><Button type="submit">Save profile</Button></form></SectionFrame>;
}

function Preferences({ title, copy, options }: { title: string; copy: string; options: string[] }) {
  return <SectionFrame title={title} copy={copy}><div className="max-w-lg space-y-4">{options.map((option) => <label key={option} className="flex items-center justify-between border-b border-sand py-3 text-body"><span>{option}</span><input type="checkbox" defaultChecked className="h-4 w-4 accent-ink" /></label>)}</div></SectionFrame>;
}

function SectionFrame({ title, copy, children }: { title: string; copy: string; children: React.ReactNode }) { return <><h2 className="font-display text-h2">{title}</h2><p className="mb-8 mt-2 text-body text-charcoal">{copy}</p>{children}</>; }
function Empty({ copy, href, label }: { copy: string; href: string; label: string }) { return <div className="border border-dashed border-stone/50 p-8"><p className="mb-4 text-body text-charcoal">{copy}</p><Link className="text-caption underline" href={href}>{label}</Link></div>; }
