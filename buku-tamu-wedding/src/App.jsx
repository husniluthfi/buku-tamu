
// App.jsx
import { useState, useEffect } from "react";

function GuestForm() {
  const [name, setName] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [attendance, setAttendance] = useState("hadir");
  const [guests, setGuests] = useState(1);
  const [message, setMessage] = useState("");
  const [guestList, setGuestList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGuestList = async () => {
      try {
        const res = await fetch(
          "https://opensheet.elk.sh/1KLqnjMqhBB6P5wChU92tbjqYve0XLJv4pvcBfl-9M48/Form%20Tamu"
        );

        if (!res.ok) throw new Error("Gagal mengakses data Google Sheet");

        const data = await res.json();
        if (!Array.isArray(data)) throw new Error("Format data tidak valid");

        const names = data
          .map((entry) => entry.Nama?.trim())
          .filter((name) => typeof name === "string" && name.length > 0);

        if (names.length === 0) throw new Error("Daftar nama kosong atau tidak valid");

        setGuestList(names);
      } catch (err) {
        console.error("Gagal memuat daftar tamu:", err);
        setError("Gagal memuat daftar tamu. Silakan coba lagi nanti.");
      } finally {
        setLoading(false);
      }
    };

    fetchGuestList();
  }, []);

  const handleCheck = () => {
    setIsValid(guestList.includes(name.trim()));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = JSON.parse(localStorage.getItem("bukuTamu") || "[]");
    data.push({ name, attendance, guests, message });
    localStorage.setItem("bukuTamu", JSON.stringify(data));
    setSubmitted(true);
  };

  if (loading) return <p>Memuat daftar tamu...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  if (submitted) {
    return (
      <div className="text-green-700 text-center">
        <p className="text-xl font-semibold">Terima kasih, {name}!</p>
        <p>Doa dan kehadiranmu sangat berarti bagi kami 💖</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
      <label className="block mb-2 font-semibold">Masukkan Nama:</label>
      <input
        className="border p-2 w-full mb-2"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
        onClick={handleCheck}
      >
        Cek Undangan
      </button>

      {isValid && (
        <form onSubmit={handleSubmit}>
          <label className="block mb-1 font-semibold">Konfirmasi Kehadiran:</label>
          <select
            className="border p-2 w-full mb-2"
            value={attendance}
            onChange={(e) => setAttendance(e.target.value)}
          >
            <option value="hadir">Hadir</option>
            <option value="tidak">Tidak Hadir</option>
          </select>

          <label className="block mb-1 font-semibold">Jumlah Orang Hadir:</label>
          <input
            type="number"
            className="border p-2 w-full mb-2"
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            min="1"
          />

          <label className="block mb-1 font-semibold">Ucapan & Doa:</label>
          <textarea
            className="border p-2 w-full mb-4"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          ></textarea>

          <button className="bg-pink-600 text-white px-4 py-2 rounded">
            Kirim Ucapan
          </button>
        </form>
      )}

      {!isValid && name !== "" && (
        <p className="text-red-500 mt-2">Nama tidak terdaftar dalam undangan.</p>
      )}
    </div>
  );
}

function AdminPanel() {
  const data = JSON.parse(localStorage.getItem("bukuTamu") || "[]");

  return (
    <div className="bg-white p-6 rounded shadow-md w-full max-w-2xl">
      <h2 className="text-xl font-bold mb-4">Data Buku Tamu</h2>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Nama</th>
            <th className="border p-2">Kehadiran</th>
            <th className="border p-2">Jumlah</th>
            <th className="border p-2">Ucapan</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td className="border p-2">{item.name}</td>
              <td className="border p-2">{item.attendance}</td>
              <td className="border p-2">{item.guests}</td>
              <td className="border p-2">{item.message}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function App() {
  const [isAdmin, setIsAdmin] = useState(false);

  return (
    <div className="min-h-screen bg-pink-50 flex flex-col items-center p-4">
      <h1 className="text-3xl font-bold text-pink-700 mb-6">
        Buku Tamu Pernikahan A & B
      </h1>

      <div className="mb-4">
        <button
          className="px-4 py-2 bg-pink-600 text-white rounded mr-2"
          onClick={() => setIsAdmin(false)}
        >
          Form Tamu
        </button>
        <button
          className="px-4 py-2 bg-gray-700 text-white rounded"
          onClick={() => setIsAdmin(true)}
        >
          Admin Panel
        </button>
      </div>

      {isAdmin ? <AdminPanel /> : <GuestForm />}
    </div>
  );
}

export default App;
