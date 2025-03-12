import { prisma } from "../Config/Prisma.js";
import { sendError, sendResponse } from "../Utils/Response.js";

export const HandleFormRegister = async (req, res) => {
  try {
    const {
      no_ktp,
      nama_lengkap,
      alamat,
      jenis_kelamin,
      no_hp,
      pekerjaan,
      tanggal_lahir,
      tanggal_donor_terakhir,
      bersedia_donor_puasa,
    } = req.body;

    console.log(req.body);

    // Validasi data tidak boleh kosong
    if (
      !no_ktp ||
      !nama_lengkap ||
      !alamat ||
      !jenis_kelamin ||
      !no_hp ||
      !pekerjaan ||
      !tanggal_lahir ||
      !bersedia_donor_puasa
    ) {
      return sendError(res, 400, "Semua kolom wajib diisi!");
    }

    // Validasi No KTP harus 16 karakter
    if (no_ktp.length !== 16) {
      return sendError(res, 400, "No KTP harus terdiri dari 16 karakter!");
    }

    // Validasi jenis_kelamin (harus 'L' atau 'P')
    const validJenisKelamin = ["L", "P"];
    if (!validJenisKelamin.includes(jenis_kelamin)) {
      return sendResponse(
        res,
        400,
        "Jenis kelamin harus 'L' (Laki-laki) atau 'P' (Perempuan)!"
      );
    }

    // Mapping pekerjaan frontend ke backend (agar sesuai dengan database)
    const pekerjaanMap = {
      TNI_POLRI: "TNI_POLRI",
      PNS_Swasta: "PNS_Swasta",
      Petani_Buruh: "Petani_Buruh",
      Mahasiswa_Pelajar: "Mahasiswa_Pelajar",
      Pedagang: "Pedagang",
    };

    // Ubah pekerjaan dari frontend ke format yang dikenali database
    const pekerjaanFormatted = pekerjaanMap[pekerjaan] || pekerjaan;

    // Validasi pekerjaan setelah dipetakan
    const validPekerjaan = [
      "TNI_POLRI",
      "PNS_Swasta",
      "Petani_Buruh",
      "Mahasiswa_Pelajar",
      "Pedagang",
    ];

    if (!validPekerjaan.includes(pekerjaanFormatted)) {
      return sendResponse(
        res,
        400,
        "Pekerjaan harus salah satu dari: 'TNI_POLRI', 'PNS_Swasta', 'Petani_Buruh', 'Mahasiswa_Pelajar', 'Pedagang'!"
      );
    }

    // Validasi bersedia_donor_puasa (harus 'Ya' atau 'Tidak')
    const validKesediaan = ["Ya", "Tidak"];
    if (!validKesediaan.includes(bersedia_donor_puasa)) {
      return sendResponse(
        res,
        400,
        "Bersedia donor puasa harus 'Ya' atau 'Tidak'!"
      );
    }

    // Hitung jumlah registrasi sebelumnya untuk no_ktp yang sama
    const countDonor = await prisma.registrasis.count({
      where: { no_ktp },
    });

    // Simpan ke database dengan donor_ke otomatis bertambah
    const newRegistration = await prisma.registrasis.create({
      data: {
        no_ktp,
        nama_lengkap,
        alamat,
        jenis_kelamin,
        no_hp,
        pekerjaan: pekerjaanFormatted,
        tanggal_lahir: new Date(tanggal_lahir),
        tanggal_donor_terakhir: tanggal_donor_terakhir
          ? new Date(tanggal_donor_terakhir)
          : null,
        donor_ke: countDonor + 1, // Donor ke bertambah sesuai jumlah sebelumnya
        bersedia_donor_puasa,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    return sendResponse(res, 201, "Registrasi berhasil!", newRegistration);
  } catch (error) {
    console.error("Error:", error);
    sendError(res, error);
  }
};

export const ValidateKtp = async (req, res) => {
  const { no_ktp } = req.body;
  if (!no_ktp) {
    return sendResponse(res, 400, "No KTP tidak boleh kosong!");
  }

  if (no_ktp.length !== 16) {
    return sendResponse(res, 400, "No KTP harus terdiri dari 16 karakter!");
  }

  try {
    const findData = await prisma.registrasis.findFirst({
      where: { no_ktp },
      orderBy: { created_at: "desc" },
      select: {
        no_ktp: true,
        alamat: true,
        bersedia_donor_puasa: true,
        donor_ke: true,
        jenis_kelamin: true,
        nama_lengkap: true,
        no_hp: true,
        pekerjaan: true,
        tanggal_donor_terakhir: true,
        tanggal_lahir: true,
        
      }
    });

    if (!findData) {
      return sendResponse(res, 404, "Nomor KTP tidak ditemukan! , Silahkan Registrasi Biodata terlebih dahulu");
    }
    sendResponse(res, 200, "Nomor KTP ditemukan!", findData);
  } catch (error) {
    console.error("Error:", error);
    sendError(res, error);
  }
};
