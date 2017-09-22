package hello;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class GamesController {

    @RequestMapping("/game")
    public String game(@RequestParam(value="name", required=false, defaultValue="game1") String name, Model model) {
        model.addAttribute("name", name);
        return "game";
    }

    @RequestMapping("/tictactoe")
    public String hostedgame(@RequestParam(value="name", required=false, defaultValue="game1") String name, Model model) {
        model.addAttribute("name", name);
        return "tictactoe";
    }

}