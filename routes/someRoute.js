import { auth } from "../middleware/auth.js";
import { allowRoles } from "../middleware/role.js";

router.get("/hod-only", auth, allowRoles("hod"), (req, res) => {
  res.json({ msg: "Only HOD can see this" });
});