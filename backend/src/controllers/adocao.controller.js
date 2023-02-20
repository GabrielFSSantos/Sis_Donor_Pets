const Adocao = require("../model/adocao.model");
const Doacao = require("../model/doacao.model");

exports.createAdocao = async (req, res) => {
  try {
    const user = req.userData;
    const doacao = await Doacao.findOne(req.body.doacao).populate("pet");

    if (!doacao) {
      return res.status(404).json({ message: "Doação não encontrada" });
    }

    if (doacao.user.toString() === user._id.toString()) {
      return res.status(400).json({
        message: "Você não pode adotar um animal do qual você é o doador",
      });
    }

    const newAdocao = new Adocao({
      data: req.body.data,
      doacao: doacao._id,
      user: user._id,
    });

    await newAdocao.save();

    return res.status(200).json({
      message: "Adoção criada com sucesso!",
      adocao: newAdocao,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Ocorreu um erro ao criar a Adoção",
      error,
    });
  }
};

exports.getAdocao = async (req, res) => {
  try {
    const user = req.userData;
    const adocoes = await Adocao.find({ user: user._id }).populate("doacao");

    return res.status(200).json({
      message: "Adoções encontradas com sucesso!",
      adocoes,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Ocorreu um erro ao buscar as Adoções",
      error,
    });
  }
};

exports.getAdocoes = async (req, res) => {
  try {
    const adocoes = await Adocao.find()
      .populate({
        path: "doacao",
        populate: [
          {
            path: "pet",
            select: "-adotado",
          },
          {
            path: "user",
            select: "-password",
          },
          {
            path: "pessoa",
          },
        ],
      })
      .populate("user");

    return res.status(200).json({
      message: "Adoções encontradas com sucesso!",
      adocoes,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Ocorreu um erro ao buscar as Adoções",
      error,
    });
  }
};

exports.updateAdocao = async (req, res) => {
  const { id } = req.params;
  const { data } = req.body;
  const userId = req.userData.userId;

  try {
    const adocao = await Adocao.findOne(id);

    if (!adocao) {
      return res.status(404).json({ message: "Adoção não encontrada" });
    }

    // Verifica se o usuário logado é o mesmo que criou a adoção
    if (adocao.user.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Você não tem permissão para atualizar essa adoção" });
    }

    adocao.data = data;
    await adocao.save();

    return res.status(200).json({
      message: "Adoção atualizada com sucesso!",
      adocao,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Ocorreu um erro ao atualizar a adoção",
      error,
    });
  }
};
