"use client";

import { useState } from "react";
import { updateProfile, addAddress, deleteAddress, logout } from "@/app/actions/auth";
import { MapPin, Package, User, Plus, Trash2, CheckCircle2 } from "lucide-react";

interface AccountUser {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  createdAt: Date;
}

interface Address {
  id: string;
  label: string | null;
  recipient: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
}

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  sku: string;
}

interface Order {
  id: string;
  orderNumber: string;
  createdAt: Date;
  total: number;
  status: string;
  paymentStatus: string;
  addressLine1: string;
  city: string;
  state: string;
  pincode: string;
  recipient: string;
  items: OrderItem[];
}

export function AccountDashboard({
  user,
  orders,
  addresses,
}: {
  user: AccountUser;
  orders: Order[];
  addresses: Address[];
}) {
  const [activeTab, setActiveTab] = useState<"orders" | "addresses" | "profile">("orders");
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [addressMessage, setAddressMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleProfileUpdate(formData: FormData) {
    setLoading(true);
    setProfileMessage("");
    const res = await updateProfile(formData);
    setLoading(false);
    if (res?.error) {
      setProfileMessage(res.error);
    } else {
      setProfileMessage("Profile updated successfully!");
      setTimeout(() => setProfileMessage(""), 4000);
    }
  }

  async function handleAddAddress(formData: FormData) {
    setLoading(true);
    setAddressMessage("");
    const res = await addAddress(formData);
    setLoading(false);
    if (res?.error) {
      setAddressMessage(res.error);
    } else {
      setIsAddingAddress(false);
      setAddressMessage("Address added successfully!");
      setTimeout(() => setAddressMessage(""), 4000);
    }
  }

  async function handleDeleteAddress(addressId: string) {
    if (confirm("Are you sure you want to remove this address?")) {
      await deleteAddress(addressId);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 md:py-20">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-ink/10 pb-8 gap-4">
        <div>
          <p className="eyebrow text-gold">Customer Portal</p>
          <h1 className="display mt-2 text-4xl sm:text-5xl">{user.name || "My Account"}</h1>
          <p className="text-sm text-ink/60 mt-1">{user.email}</p>
        </div>
        <form action={logout}>
          <button className="text-xs uppercase tracking-[0.15em] font-bold text-ink/70 hover:text-ink underline py-2">
            Sign out
          </button>
        </form>
      </div>

      <div className="mt-8 flex gap-3 border-b border-ink/10 pb-3 overflow-x-auto text-xs uppercase tracking-[0.15em] font-semibold">
        <button
          onClick={() => setActiveTab("orders")}
          className={`flex items-center gap-2 px-4 py-2 transition ${
            activeTab === "orders" ? "border-b-2 border-gold text-ink" : "text-ink/50 hover:text-ink"
          }`}
        >
          <Package size={15} /> Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab("addresses")}
          className={`flex items-center gap-2 px-4 py-2 transition ${
            activeTab === "addresses" ? "border-b-2 border-gold text-ink" : "text-ink/50 hover:text-ink"
          }`}
        >
          <MapPin size={15} /> Addresses ({addresses.length})
        </button>
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 px-4 py-2 transition ${
            activeTab === "profile" ? "border-b-2 border-gold text-ink" : "text-ink/50 hover:text-ink"
          }`}
        >
          <User size={15} /> Profile Details
        </button>
      </div>

      {activeTab === "orders" && (
        <div className="mt-8">
          {orders.length === 0 ? (
            <div className="border border-dashed border-ink/20 p-12 text-center">
              <p className="display text-3xl">No orders yet.</p>
              <p className="mt-3 text-sm text-ink/60">
                You haven&apos;t placed any orders yet. Discover our collection for unhurried comfort.
              </p>
              <a
                href="/shop"
                className="mt-6 inline-block bg-ink px-6 py-3 text-xs font-bold uppercase tracking-[.16em] text-white"
              >
                Browse Shop
              </a>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.id} className="border border-ink/10 bg-white/70 p-6 rounded-sm">
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-ink/10 pb-4">
                    <div>
                      <p className="font-bold text-sm tracking-wide">Order #{order.orderNumber}</p>
                      <p className="text-xs text-ink/60 mt-0.5">
                        Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-gold/15 text-gold rounded">
                        {order.status}
                      </span>
                      <p className="text-sm font-semibold mt-1">₹{order.total.toLocaleString("en-IN")}</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-ink/50 mb-2">Items</p>
                    <div className="divide-y divide-ink/5">
                      {order.items.map((item) => (
                        <div key={item.id} className="py-2 flex justify-between text-sm">
                          <div>
                            <span>{item.productName}</span>
                            <span className="text-xs text-ink/50 ml-2">× {item.quantity}</span>
                          </div>
                          <span className="font-medium text-xs">
                            ₹{(item.unitPrice * item.quantity).toLocaleString("en-IN")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 border-t border-ink/10 pt-3 text-xs text-ink/60 flex justify-between items-center">
                    <span>
                      Delivery: {order.recipient}, {order.addressLine1}, {order.city}, {order.state} - {order.pincode}
                    </span>
                    <span className="uppercase text-[11px] font-medium text-ink/70">
                      Payment: {order.paymentStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "addresses" && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Saved Addresses</h2>
            {!isAddingAddress && (
              <button
                onClick={() => setIsAddingAddress(true)}
                className="flex items-center gap-1.5 bg-ink text-white px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-gold transition"
              >
                <Plus size={14} /> Add New Address
              </button>
            )}
          </div>

          {addressMessage && (
            <p className="mb-4 p-3 bg-emerald-50 text-emerald-800 text-sm rounded flex items-center gap-2">
              <CheckCircle2 size={16} /> {addressMessage}
            </p>
          )}

          {isAddingAddress && (
            <form action={handleAddAddress} className="border border-ink/15 p-6 mb-8 bg-sand/40 space-y-4">
              <p className="font-semibold text-sm">Add New Delivery Address</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <input
                  name="label"
                  placeholder="Address Label (e.g. Home, Office)"
                  defaultValue="Home"
                  className="border border-ink/20 p-2.5 text-sm bg-white outline-none focus:border-gold"
                />
                <input
                  name="recipient"
                  required
                  placeholder="Recipient Name"
                  defaultValue={user.name || ""}
                  className="border border-ink/20 p-2.5 text-sm bg-white outline-none focus:border-gold"
                />
              </div>
              <input
                name="line1"
                required
                placeholder="Address Line 1 (Street, Flat, House No.)"
                className="w-full border border-ink/20 p-2.5 text-sm bg-white outline-none focus:border-gold"
              />
              <input
                name="line2"
                placeholder="Address Line 2 (Apartment, Landmark - optional)"
                className="w-full border border-ink/20 p-2.5 text-sm bg-white outline-none focus:border-gold"
              />
              <div className="grid sm:grid-cols-3 gap-4">
                <input
                  name="city"
                  required
                  placeholder="City"
                  className="border border-ink/20 p-2.5 text-sm bg-white outline-none focus:border-gold"
                />
                <input
                  name="state"
                  required
                  placeholder="State"
                  className="border border-ink/20 p-2.5 text-sm bg-white outline-none focus:border-gold"
                />
                <input
                  name="pincode"
                  required
                  placeholder="PIN Code"
                  className="border border-ink/20 p-2.5 text-sm bg-white outline-none focus:border-gold"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-ink text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-gold transition"
                >
                  {loading ? "Saving..." : "Save Address"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingAddress(false)}
                  className="border border-ink/20 px-5 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-white transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {addresses.length === 0 && !isAddingAddress ? (
            <div className="border border-dashed border-ink/20 p-8 text-center text-sm text-ink/60">
              No saved addresses found. Add a delivery address for faster checkout.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {addresses.map((addr) => (
                <div key={addr.id} className="border border-ink/10 bg-white/70 p-5 rounded relative">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-ink/5 rounded">
                      {addr.label || "Address"}
                    </span>
                    <button
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Delete address"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <p className="font-semibold text-sm mt-3">{addr.recipient}</p>
                  <p className="text-xs text-ink/70 mt-1 leading-5">
                    {addr.line1}
                    {addr.line2 && <><br />{addr.line2}</>}
                    <br />
                    {addr.city}, {addr.state} - {addr.pincode}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "profile" && (
        <div className="mt-8 max-w-lg">
          <h2 className="text-lg font-semibold mb-6">Personal Information</h2>
          {profileMessage && (
            <p className="mb-4 p-3 bg-emerald-50 text-emerald-800 text-sm rounded flex items-center gap-2">
              <CheckCircle2 size={16} /> {profileMessage}
            </p>
          )}
          <form action={handleProfileUpdate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink/60 mb-1">
                Full Name
              </label>
              <input
                name="name"
                defaultValue={user.name || ""}
                required
                className="w-full border border-ink/20 p-3 text-sm bg-white outline-none focus:border-gold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink/60 mb-1">
                Email Address
              </label>
              <input
                disabled
                value={user.email}
                className="w-full border border-ink/10 p-3 text-sm bg-ink/5 text-ink/60 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink/60 mb-1">
                Phone Number
              </label>
              <input
                name="phone"
                defaultValue={user.phone || ""}
                placeholder="+91 9876543210"
                className="w-full border border-ink/20 p-3 text-sm bg-white outline-none focus:border-gold"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-ink text-white px-6 py-3 text-xs font-bold uppercase tracking-wider hover:bg-gold transition mt-4"
            >
              {loading ? "Updating..." : "Update Profile"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
