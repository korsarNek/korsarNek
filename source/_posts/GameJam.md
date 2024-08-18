---
title: GameJam
date: 2024-08-18
comment: true
id: GameJam
language: de
mermaid: false
threejs: true
banner_img: /img/city.webp
title_class: banner-text-bright
image: post_assets/GameJam/navigationmesh.webp
tags:
    - Programmierung
    - 3D Modellierung
    - Spieleentwicklung
excerpt: Mein erster GameJam.
---

# Mein erster GameJam

## Was ist ein GameJam?

Ein GameJam ist ein zeitlich begrenztes Projekt, wo man versucht ein kleines Spiel zu entwickeln. Es gibt fast immer ein bestimmtes Thema oder Genre an das man sich halten muss. Bei diesem GameJam war das Thema Alchemie und Schatten, das heißt die Spielmechaniken oder das Design sollten irgendeinen Bezug zu Alchemie und Schatten haben. Was auch immer man darunter verstehen mag. Alchemie kann zum Beispiel Umwandlung oder Kombinieren sein, oder direkt das Brauen von Tränken. Schatten kann mit Licht und Schatten zu tun haben, sich verstecken, oder etwas das im Verborgenen geschieht. Es gab auch die Restriktion, dass das Spiel im Browser laufen muss und dass die Assets die man benutzt, kommerziele Nutzung erlauben. Dieser GameJam ging 2 Wochen, viele sind kürzer, manche etwas länger, aber immer hat man weniger Zeit als man eigentlich bräuchte.

Ich habe den GameJam gemacht, weil ich es ein interessantes Projekt finde, ich spiele gerne spiele und habe mich in der Vergangenheit auch mit Spieleentwicklung beschäftigt. Für mich hat es sich auch gerade angeboten, weil ich arbeitslos war und die Zeit dafür hätte.

## Anfangen

Ich hatte mich einen Monat bevor der GameJam anfing angemeldet, damals war das Thema noch nicht bekannt, das wurde erst an dem Tag bekannt gegeben, an dem der GameJam auch anfing. Ich habe den GameJam mit einem anderen Entwickler zusammen gemacht, wir haben dann mit Brainstorming angefangen und [diverse Ideen gesammelt](https://chisel-meeting-7bb.notion.site/GameJam-000449f2d3554bd1a447bb6d643cf9b1?pvs=4). An einer Idee hatten wir das meiste Interesse und haben sie während des Brainstormings am meisten ausgearbeitet. Es ging dabei um eine Art Management-Spiel mit Vampiren. Sie haben einen Unterschlupf in der Stadt, den man ausbauen kann, mit Familiaren die tagsüber diverse Aufgaben übernehmen und nachts sind die Vampire aktiv und gehen auf Jagd. Es gäbe dort auch Missionen und Kämpfe, das Kampfsystem war dabei etwas an Shadowrun und XCOM angelehnt. Der nächste Teil war dann, drastisch zu kürzen, erst einmal sind alle Ideen bis auf das Vampir-Management rausgeflogen, dann wir entschieden uns, dass der Kampfteil für uns interessanter ist als das Management, dann wurde das Kampfsystem auch noch zum Großteil eingestampft um es in 2 Wochen vielleicht noch schaffen zu können. Viele Ideen die uns da gefallen haben, würden wahrscheinlich wieder rein kommen, falls wir weitermachen sollten nach dem GameJam, aber im Moment passen die nicht hinein. Thematisch würde es zu Vampiren passen, weil die sich nur Nachts hinaus trauen, eine der Fähigkeiten sollte auch eine Schattenform sein, wodurch sich Vampire durch Hindernisse bewegen können und währenddessen auch nicht angegriffen werden können. Alchemie würde passen, weil Menschen von Vampiren umgewandelt würden.

### Aufgabenteilung

Ich wollte das Projekt mit einem anderen Entwickler zusammen machen. Als erfahrener Entwickler würde ich die Systeme programmieren und aufgrund meiner Kenntnisse von Blender die 3D Assets machen. Der andere Entwickler sollte die UI, Musik und Content machen.

Leider ist in den GameJam ein Probearbeitstag für ein Unternehmen und noch eine Coding-Challenge für ein anderes Unternehmen gefallen, weshalb ich leider nicht so viel Zeit für den GameJam hatte wie ich Anfangs gedacht hatte. Die hatten natürlich Vorrang, aber haben auch einiges an wertvoller Zeit gekostet.

### Engine

Als Engine habe ich Godot gewählt. Ich hatte in der Vergangenheit ein paar kleinere Projekte mit Unity gemacht, aber nach der [Kontroverse mit Unity](https://www.theverge.com/2023/9/12/23870547/unit-price-change-game-development), wollte ich lieber etwas anderes ausprobieren. Mit Godot kann man gut 2D und auch etwas 3D machen, keine sehr komplexen Sachen, mit Unreal Engine kann es nicht mithalten, aber für ein einfaches Spiel sollte es eine gute Wahl sein und nicht all zu schwer rein zu kommen. Ein großes Pluspunkt ist auch, dass Godot open source ist, was es mir deutlich einfacher machen sollte, falls ich irgendwo hängen bleibe kann ich nachschauen was passiert und warum etwas nicht funktioniert.

## Implementieren

Gerade für den Anfang wollten wir schnell ein paar Platzhalter-Assets verwenden um die dann später auszutauschen, wenn wir eine spielbare Version haben. Leider sind wir nie soweit gekommen, so hat leider auch die letzte Version, immer noch die Platzhalter drinnen.

Am Anfang war es auch angedacht, dass wir das Spiel mit 2D Assets machen, wir hatten da bereits einige Assets gesammelt. Animierte Charaktere zu finden, die kostenlos sind, stellte sich aber schwierig heraus. Ein paar haben wir gefunden, aber der Stil war halt komplett durcheinander. 3D Assets haben zumindest den Vorteil, dass man Animationen remappen kann auf ein anderes Modell, solange der Skelett für die Animation kompatibel ist.

Wir hatten auch überlegt nur die Charaktere in 3D zu machen. Um 3D Elemente in 2D in Godot zu integrieren muss man das 3D Modell auf eine separate Textur rendern und dann könnte man das einbetten, leider ein bisschen zu umständlich, das Nächstbeste wäre 2D in eine 3D-Umgebung einzufügen. Jetzt haben wir einfach alles in 3D gemacht. Es ist aber etwas umständlicher einen interessanten Grafikstil in 3D zu machen. Eine Mischvariante mit 2D Umgebung und 3D Charaktere ist etwas, dass ich mir in Zukunft noch einmal genauer anschauen will.

### 3D Assets

#### Barrikade

Ich habe für das Spiel eine kleine Barrikade selbst gemacht in Blender. Es ist lange her, dass ich mit [UV-Maps](https://gamedev.stackexchange.com/questions/6911/what-exactly-is-uv-and-uvw-mapping) gearbeitet hatte und musste da wieder etwas reinkommen.

![UV Mapping Blender interface](/post_assets/GameJam/uv_mapping.webp)

UV-Maps werden zur Texturierung von Modellen verwendet, die U- und V-Koordinaten zeigen auf einen 2D-Bereich in einer Textur, dieser Bereich wird dann auf eine Fläche des 3D-Modells gezeichnet. Für meine Barrikade habe ich nur eine einzelne Textur verwendet.

<threejs model="/post_assets/GameJam/blockade.glb" style="aspect-ratio: 4/3"></threejs>

#### Blender Default Assets

Blender bietet diverse assets an, mit einer Lizenz die auch kommerzielle Nutzung erlaubt. Man muss sie nur erst einmal [finden](https://www.blender.org/download/demo-files/#assets), einfach mitinstalliert werden die nicht. Ich habe davon einen "Body Male - Primitive (Realistic)" als Basis genommen, eigentlich wollte ich ihn noch etwas modellieren und texturieren um ihn mehr wie einen Vampir aussehen zu lassen, bin aber nicht mehr dazu gekommen. Es ist schwierig kostenfreie 3D Modelle online zu finden die etwas taugen, alle guten Modelle kosten Geld.

<threejs model="/post_assets/GameJam/vampire.glb" style="aspect-ratio: 1/1"></threejs>

#### Buildify

[Buildify](https://paveloliva.gumroad.com/l/buildify?a=299264723) ist eine kostenlose Blender-Datei die man sich herunterladen kann, mit der man dann mit Hilfe von Geometry Nodes sehr einfach Gebäude entwerfen kann. Man definiert einfach eine Grundfläche und per GeometryNodes wird dann aus verschiedenen Modulen ein Gebäude zusammengestellt.

{% gi 2 2 %}
  ![buildify base](/post_assets/GameJam/buildify_ground.webp)
  ![buildify generated](/post_assets/GameJam/buildify_full.webp)
{% endgi %}

<threejs model="/post_assets/GameJam/buildify_modules.glb" style="aspect-ratio: 4/3"></threejs>

Die Module kann man auch gegen eigene austauschen.

<my-youtube video-id="jl49SBW6wnU"></my-youtube>

GeometryNodes sind ein Node-basiertes System in Blender womit man diverse Operationen miteinander verknüpfgen kann, durch die dann ein neues Modell bzw. Geometry entsteht.

![Buildify Geometry Nodes](/post_assets/GameJam/buildify_geometry_nodes.webp)

Das ist nur ein kleiner Ausschnitt der GeometryNodes, jedes der grünen Nodes besteht selbst wiederum aus mehreren Unternodes. Grob funktioniert Buildify danach, dass es die Geometry der Grundfläche klassifiziert, in Ränder (keine Wände entlang Linien innerhalb der Grundfläche erzeugen, nur entlang der Umrandung) und Ecken (gesonderte Module für Eckstücke). Dann die Länge der einzelnen Randstücke durch die Größe des Moduls teil um dort die Module zu platzieren und wenn die Zahl nicht komplett aufgeht, werden die Module etwas gestreckt um über die ganze Länge zu gehen. Das wird wiederholt für die unterschiedlichen Etagen des Gebäudes wofür dann unterschiedliche Module herangezogen werden können. Das Erdgeschoss hat in der Regel andere Module als der Rest. Für das Dach wird die verfügbare Fläche noch unterteilt danach wo Platz ist für große, mittlere oder kleine Details, die entsprechenden Dachmodule werden dort platziert und danach werden zufällig Module wieder entfernt um da etwas Freifläche auf dem Dach zu haben.

#### Buildify Alternativen

Ich hatte mir auch noch einige weitere Möglichkeiten angeschaut in Blender Gebäude schnell erstellt zu können, Zwei sahen da recht interessant aus, waren aber im Gegenteil zu Buildify kostenpflichtig. [Procedural Building Generator](https://blendermarket.com/products/pbg-2) und [Auto-Building](https://blendermarket.com/products/auto-building). Bei Gelegenheit werde ich mir mal eines von denen kaufen und ausprobieren, vielleicht ja beim nächsten GameJam, wenn ich wieder Gebäude brauche. Bei diesen beiden hat man deutlich mehr Kontrolle über das Aussehen der Gebäude, weil da die 3 dimensionale Form eines Modells herangezogen wird und nicht nur die Grundfläche, wie bei Buildify.

### Animationen

#### Mixamo

[Mixamo](https://www.mixamo.com/) ist eine Webseite auf der man kostenlos Animationen auf Modelle übertragen kann, selbst das [rigging](https://medium.com/wharf-street-studios/3d-rigging-essential-for-animation-character-design-11438c6962d6) kann die Seite für einen übernehmen. Nachdem ein paar wichtige Punkte an dem Modell definiert hat, lädt die Seite ein paar Minuten und schon kann man Animationen aus der Bibliothek wählen und sie live am Modell sehen.

<my-youtube video-id="ZOE8lE8GCnU"></my-youtube>

<threejs model="/post_assets/GameJam/vampire.glb" style="aspect-ratio: 1/1" animations="all except smoothed1"></threejs>

#### Mehrere Animationen in Blender

Etwas was ich bisher noch nie gebraucht hatte, ist es mehrere Animationen an einem 3D Modell in Blender zu haben. Leider finde ich das nicht besonders intuitiv und ich musste etwas suchen wie man das macht.

Wenn man eine Animation über Mixamo macht, muss man danach das Model runterladen und in der Datei ist dann nur diese 1 Animation, über Mixamo kann man nicht mehrere Animationen auf einmal definieren. Man muss die Animationen dann selbst separat zusammenfügen. Eine Methode das über Blender zu machen, ist es die ganzen Modelle in eine Blender-Szene zu importieren. Man hat dann das selbe Modell viele Male, mit nur einer Animation jeweils. Man kann alle Löschen bis auf eine. In der Blender-Datei sind dann immer noch die Animationtracks von den Modellen die man gelöscht hat.

Über den Dopesheet-Editor kann man noch auf alle Animationtracks zugreifen auch wenn die dazugehörigen Modelle und Armatures gelöscht wurden.
![Dopesheet-Editor Tracks](/post_assets/GameJam/dopesheet_animations.webp)

Um die Animationen in Godot verwenden zu können, muss man die Animationtracks in Animationstrips bzw. Clips umwandeln. Dafür kann man in Blender den NLA-Editor(Non-Linear Animation) verwenden. Im orangenen Bereich wird der aktuelle Strip angezeigt, den man bearbeiten kann, wenn der ausgewählt ist kann man rechts einen Track auswählen und dann "push down" drücken um den Track in einen neuen benannten Clip umzuwandeln.

{% gi 2 1-1 %}
  ![Select Track](/post_assets/GameJam/non_linear_animation_select_track.webp)
  ![Push Down](/post_assets/GameJam/non_linear_animation_push_down.webp)
{% endgi %}

Wenn man die dann als GLTF exportiert und bei Godot wieder importiert, hat man an dem Modell einen AnimationPlayer, der die Clips beinhält, den kann man mit einem so gennanten AnimationTree-Node verbinden und dann die Animationen im Spiel verwenden.

In Blender kann man auch mehrere Animationen in einem Strip platzieren und übergänge zwischen den Animationen definieren. Das ist nützlich um mehrere wiederkehrende Animationen für eine längere Animation in Blender wiederzuverwenden, aber für Godot, wo wir die Animationen einzeln haben wollen und dann selbst mischen, ist das nicht notwendig.

#### Animation Trees

In vielen Game Engines gibt es ein System um Animationen an Bedingungen zu knüpfen und die Übergänge der Animationen ineinander zu konfigurieren. In Godot heißt das System AnimationTree.

Weiter oben spielt er alle Animationen nacheinander ab, ohne Übergänge, was nicht gut aussieht durch die abrupten Bewegungen. Hierunter sind die Animationen noch einmal nacheinander abgespielt, aber mit Übergängen dazwischen. Die Übergänge entstehen dadurch, dass er die Animationen über einen Zeitraum miteinander mischt und zum Beispiel für die Gliedmaßen neue Positionen interpoliert zwischen den Positionen wie sie in den 2 Animationen wären, die gemischt werden. Dadurch bekommt man bereits ein recht gutes Ergebnis, ohne nachträglich noch die Animation für die Übergänge anpassen zu müssen. Es gibt auch komplexere Systeme die die Übergänge besser machen, aber hierfür ist das vollkommen ausreichend.
<threejs model="/post_assets/GameJam/vampire.glb" style="aspect-ratio: 1/1" animations="single smoothed1"></threejs>

<div class="group-image--align">
{% gi 2 2 %}
  ![AnimationTree](/post_assets/GameJam/animationtree.webp)
  ![AnimationTree Properties](/post_assets/GameJam/animationtree_properties.webp)
{% endgi %}
</div>

Hier sieht man wie der AnimationTree aufgebaut ist, es sieht in den Engines immer sehr ähnlich aus. Es ist ein Node-basierter Editor in dem Animationen auf unterschiedliche Weise miteinander verknüpfen kann um dann eine finale Animation heraus zu bekommen. Links sieht man die "idle", "running", "aim" und "dying" Animationen die mit einer Transition verbunden wurden. Dadurch kann man in Godot steuern, welche der Animationen gerade aktiv sein soll und dass er bei einem Wechsel über einen vordefinierten Zeitraum auch zwischen den Animationen interpoliert. Die Animationen können dabei an jeder beliebigen Stelle unterbrochen werden, nicht nur am Ende einer Animation. Bei "running" ist auch noch ein TimeScale dazwischen, dadurch kann die Animation beschleunigt oder verlangsamt werden, wenn wir das mit der Bewegungsgeschwindigkeit des Characters verknüpfen, wird die Animation auch schneller abgespielt, wenn sich der Charakter schneller bewegt.

Wenn man über das Transition eine Animation wechselt, wird nur noch diese Animation absgepielt, entweder in einer Endlosschleife, oder wie bei "dying" einmalig und dann wird das letzte Animationframe gehalten. Bei den OneShots kann eine Animation starten und nach Ende der Animation kehrt er automatisch wieder zur vorherigen Animation zurück. Wenn jemand also getroffen wird, wird einmal die entsprechende Animation abgespielt und danach würde er automatisch wieder zur idle Animation zurückkehren, die als "in" für den OneShot verknüpft ist.

Jedes der Elemente wie "Transition", "Running Scale" oder die OneShots "Shooting", "Hit" und "Big Hit" sind als eigene Felder im Inspektor verfügbar. Über den Eigenschaftspfad kann für die dann einen Wert im Code setzen.

Ich habe für meinen Charakter 2 Methoden geschrieben zum Abspielen von Animationen, einmal `ChangeAnimationState`, dass die Transition ändert und `PlayAnimation` für OneShots. Bei `ChangeAnimationState` benutzt man `set` des AnimationTrees um die Eigenschaft, deren Pfad man aus dem Inspektor bekommt, auf die Zielanimation zu wechseln.

Für die Animationen habe ich auch noch eine statische Klasse angelegt, damit man etwas Autovervollständigung bei der Auswahl der Animation bekommt und den String nicht jedes Mal neu schreiben muss.

```csharp
public void ChangeAnimationState(string animationName)
{
    _animationTree!.Set("parameters/Transition/transition_request", animationName);
}

public static class Animation
{
    public static string Idle => "idle";
    public static string Running => "running";
    public static string Hit => "hit";
    public static string BigHit => "big hit";
    public static string Dying => "dying";
    public static string Shooting => "shooting";
    public static string Aiming => "aiming";
}
```

Leider ist man bei Godot auf C# 10 beschränkt, wodurch soetwas wie [primary constructors](https://learn.microsoft.com/de-de/dotnet/csharp/whats-new/tutorials/primary-constructors) leider nicht unterstützt werden. Damit hätte man sehr kurz auch eine typen-sichere Variante der Animation-Klasse schreiben können:

```csharp
public class StateAnimation(string Value)
{
    public static StateAnimation Idle => "idle";
    public static StateAnimation Running => "running";
    public static StateAnimation Aiming => "aiming";
    public static StateAnimation Dying => "dying";

    public static implicit operator StateAnimation(string str) => new StateAnimation(str);
}
```

In der `PlayAnimation` sieht man eine Möglichkeit um aus einem Event oder Callback einen `Task` zu machen. Wir lösen die OneShot-Animation aus und danach schreiben wir in eine Liste den "request" für die Animation. Wenn wir dann über ein Event später informiert werden, dass die Animation vorbei ist, schließen wir alle `TaskCompletionSource`s für diese Animation ab.

```csharp
public Task PlayAnimation(string animationName)
{
    _animationTree!.Set($"parameters/{animationName}/request", (int)AnimationNodeOneShot.OneShotRequest.Fire);
    if (!_animationRequests.TryGetValue(animationName, out var list))
    {
        list = new List<TaskCompletionSource>();
        _animationRequests[animationName] = list;
    }

    var task = new TaskCompletionSource();
    list.Add(task);

    return task.Task;
}

private void _AnimationFinished(StringName name)
{
    if (!_animationRequests.TryGetValue(name.ToString(), out var list))
        return;

    foreach (var task in list)
        task.SetResult();

    list.Clear();
}
```

Wenn wir eine Aktion ausführen, dann eine Animation abspielen, und den GameState dann erst wieder ändern wollen wenn die Animation fertig abgespielt hat, ist es nützlich eine Animation "awaiten" zu können. Das erlaubt es uns den Code für das Feuern einer Waffe etwas einfacher zu schreiben, anstatt dafür auf separate Events hören oder einen Callback übergeben zu müssen.

```csharp
private async void _TargetSelected(unit target)
{
    _battle_ui!.Suspend();
    _unit!.ActionPoints--;
    await _unit!.PlayAnimation(unit.Animation.Shooting);
    _unit!.ChangeAnimationState(unit.Animation.Idle);
    target.ReceiveDamage(new Damage(Damage, _unit!, this));
    _unit!.FinishAction();
}
```

Wir unterbinden hier weitere Aktionen in der UI, ziehen den Aktionspunkt für das Schießen ab, spielen die Animation und erst nach dem die shooting-Animation abgespielt wurde, erhält die Zieleinheit Schaden und spielt daraufhin ihre eigene Animation ab, anstatt das alles sofort gleichzeitig passiert. Sonst würde der Gegner Schaden erhalten und seine Hit-Animation abspielen bevor der Gegner überhaupt die Waffe abgefeuert hat.

### Grid Movement

Für das Spiel wollte ich die Charaktere sich in einem Gitter bewegen lassen. Jeder Charakter hat dabei eine Bewegungsreichweite, die er in einem Zug zurücklegen kann und wenn ein Hindernis auf der Karte ist, sollen die verfügbaren Felder entsprechend um das Hindernis herum berechnet werden.

![Gitter um Hindernis herum](/post_assets/GameJam/grid_around_obstacle.webp)

Ich baue dafür ein Gitter auf, mit Feldern entsprechend der Bewegungsreichweite x 2 + 1 und prüfen dann jedes Feld auf dem Gitter, ob es dort eine Kollision mit einem relevanten Objekt gibt.

```csharp
var space = GetWorld3D().DirectSpaceState;

...

var box = new BoxShape3D()
{
    Size = GridSize3,
};

var intersection = space.IntersectShape(new PhysicsShapeQueryParameters3D()
{
    CollideWithBodies = true,
    CollisionMask = 0b10,
    Shape = box,
    Transform = Transform3D.Identity.Translated(ToWorldCoordinates(new Vector2I(x, y))),
}, maxResults: 1);

if (intersection.Count != 0)
    _grid[x, y] = GridCellState.NotReachable;
```

Danach mache ich einen FloodFill von der Position des Spielers aus um alle erreichbaren Felder zu markieren.

```csharp
private void FloodFill(Vector2I coordinate, int range)
{
    var queue = new Queue<(Vector2I, int)>();
    queue.Enqueue((coordinate, range));

    while (queue.Count != 0)
    {
        var (coord, remainingRange) = queue.Dequeue();
        Process(coord, remainingRange);
    }

    _grid[coordinate.X, coordinate.Y] = GridCellState.Self;

    void Process(Vector2I coordinate, int range)
    {
        _grid[coordinate.X, coordinate.Y] = GridCellState.Moveable;

        range--;
        if (range <= 0)
            return;

        var (up, right, down, left) = SurroundingCoordinates(coordinate);
        if (isValid(left))
            queue.Enqueue((left, range));
        if (isValid(right))
            queue.Enqueue((right, range));
        if (isValid(up))
            queue.Enqueue((up, range));
        if (isValid(down))
            queue.Enqueue((down, range));

    }

    bool isValid(Vector2I coordinate)
    {
        return IsInGrid(coordinate) && _grid[coordinate.X, coordinate.Y] == GridCellState.NotInitialized;
    }
}

private (Vector2I up, Vector2I right, Vector2I down, Vector2I left) SurroundingCoordinates(Vector2I coordinate)
{
    return (
        coordinate with { Y = coordinate.Y - 1 },
        coordinate with { X = coordinate.X + 1 },
        coordinate with { Y = coordinate.Y + 1 },
        coordinate with { X = coordinate.X - 1 }
    );
}
```

Damit erzeuge ich dann für jedes erreichbare Feld ein kleines Quadrat, in der Zukunft hätte man das auch besser machen können in dem nur die Outline des erreichbaren Bereichs angezeigt wird, aber für den Anfang sollte das reichen.

### Path Finding

Godot bietet eine Implementation für Path Finding in 2D und 3D,d ie ermöglicht es, dass ein "Agent" selbstständig eine Route findet, wenn man einen Zielort angibt. Der Agent wird dann um Hindernisse herumlaufen und dabei versuchen die kürzeste Strecke zu laufen. Man verknüpft das CharacterBody3D-Node für eine Figur mit einem Skript und in der `_PhysicsProcess`-Methode des Skriptes fragt man den Agent nach dem nächsten Ziel. Die Strecke wird bei der Berechnung der Route in Segmente unterteilt, hier fragt man den Zielpunkt des aktuellen Segmentes an und wenn die Entfernung klein genug ist, wird durch das `NavigationAgent3D`-Node selbständig das nächste Segment ausgewählt, bis man das Ziel erreicht. Im Code kann man abfragen ob die Navigation abgeschlossen ist und dann darauf reagieren.

Um die Bewegung ansich auszuführen bietet Godot die Funktionen `MoveAndSlide` und `MoveAndCollide` an. Für `MoveAndSlide` setzt man vorher eine `Velocity` und Godot versucht einen entlang dieser Velocity (Entfernung pro Sekunde) zu bewegen, wenn es eine Kollision gab gibt die Funktion `true` zurück und lässt den Character selbständig um ein Hindernis drumherum sliden anstatt einfach stehen zu bleiben. Bei `MoveAndCollide` gibt man explizit die Entfernung an, die man sich in einem Frame bewegen will und es wird gegebenenfalls ein `Collision`-Objekt zurückgegeben, das Details über die Kollision beinhält, zum Beispiel mit was man kollidiert ist, an welcher Stelle und in welcher Richtung die Kollision.

Ich habe dafür `MoveAndCollide` benutzt weil es einem die Möglichkeit gibt, mit seiner Umgebung zu interagieren, so kann in dem Spiel, wenn man gegen einen Pappkarton läuft, diesen durch die Gegend kicken.

<my-youtube video-id="9n2nmNxuN2k"></my-youtube>

Der Code dafür sieht so aus:
```csharp
private void _Move(Vector3 next, float speed, float delta)
{
    var direction = GlobalPosition.DirectionTo(next);
    if (direction.Dot(UpDirection) < 0.9)
        LookAt(next, UpDirection, true);
    
    // Kick objects around if we are colliding.
    var collision = MoveAndCollide(direction * speed * delta);
    if (collision is not null && collision.GetCollider() is RigidBody3D body)
    {
        body.ApplyForce(collision.GetNormal() * -1 * speed * speed * Weight * delta, body.ToLocal(collision.GetPosition()));
    }
}
```

Die Normale der Kollision ist die Richtung des Kontaktpunktes zwischen den Objekten, mit -1 multipliziert dreht man die Richtung um 180°, damit die Force auf den Karton zeigt und nicht auf die Spielfigur. Die angewandte Kraft ist dann die Geschwindigkeit² x Gewicht der Spielfigur x delta. Delta ist die Zeit seit dem letzten Frame in Sekunden. Bei 60fps wären das 0,016 Sekunden.

Das wäre das Equivalent dieser Formel: $F = m × a$

Der Karton ist als RigidBody3D-Node in Godot hinterlegt, wenn man darauf ein Force anwendet, kann das Objekt durch die Gegend geschleudert werden. Eine unnötige aber lustige kleine Spielerei die ich mit eingebaut hatte während ich mich mit Godot vertraut gemacht habe.

Ein etwas unschönes Verhalten von der Navigation ist, dass der Agent nicht genau an das Ziel bewegt wird, selbst wenn der Zielort frei ist. Der Agent hat zum Beispiel einen Radius von 0,5m, die er braucht um nicht an Hindernissen hängen zu bleiben. Leider bleibt der Agent dann auch am Ziel stehen wenn er eigentlich noch 0,5m entfernt ist. Hier reicht das nicht, er muss sich in die Mitte eines Feldes bewegen und darf nicht halb außerhalb stehen. Dafür musste ich leider noch etwas eigenen Code reinschreiben, womit der Charakter, nach dem Erreichen des Ziels, sich noch das letzte Stück einfach in die Richtung zum Ziel bewegt, ohne irgendwelches Path Finding.

Sicherheitshalber berechne ich am Start einer Route, die erwarte Dauer und starte einen Timer mit dieser Dauer + etwas Buffer, nach dessen Ablauf sich die Einheit einfach direkt an das Ziel teleportiert. Ich hatte beim Spielen von XCOM zu häufig das Problem, dass eine Einheit irgendwo hängen geblieben ist, das Spiel daraufhin einen soft lock hatte und man neu laden musste.

Die Route die der Agent benutzt basiert auf einem "NavigationMesh", das kann man mit einer NavigationRegion3D generieren, das ist der halbdurchsichtige türkise Bereich auf dem Bild.
![Navigation Mesh](/post_assets/GameJam/navigationmesh.webp)

Die Eckpunkte und Kanten des Meshes gehen um Kollisionobjekte herum, bei der Generierung des Meshes muss man auch die Größe des Agents angeben, damit er sich korrekt um Hindernisse herum bewegt und nicht daran hängen bleibt. Für dieses NavigationMesh werden nur Nodes beachtet die von StaticBody3D erben. Dieser Node-Typ ist leider nur für Objekte gedacht die sich in der Szene nicht bewegen können. Die Spielfiguren sind aber CharacterBody3D, wenn sich Figuren an einander vorbei können sollen, ist das etwas komplizierter.

#### Agent Avoidance

In Godot nennt sich die Möglichkeit sich um nicht-statische Hindernisse herum zu bewegen Agent Avoidance. Leider ist das System [nicht sehr schlau](https://forum.godotengine.org/t/correct-way-to-implement-one-way-avoidance/45203/7). Es funktioniert ähnliche wie `MoveAndSlide`, nur dass man sich die angepasste Velocity per Event später zurückholen muss, um dann die Bewegung auszuführen. Die Berechnung, wie sich ein Charakter bewegen soll um einem anderen auszuweichen, findet asynchron statt. Leider funktioniert sie nur wenn beide Charaktere einander ausweichen, wenn nur einer dem anderen Ausweichen soll, slidet der Charakter hin und her und bleibt stecken. Es gibt laut Github Issues leider noch einige weitere Szenarien in denen die Agent Avoidance nicht funktioniert und es ist nicht vorgesehen das zu ändern, stattdessen soll in zukünftigen Versionen nur ein [Hinweis](https://github.com/godotengine/godot-docs/pull/8968/files) angezeigt werden, dass das System diverse Restriktionen hat. Leider war damit das Agent Avoidance-System für mich nicht wirklich eine Option.

Ich könnte das NavigationMesh bei jedem Zug auch neu erzeugen. Das Problem dabei ist aber, dass CharacterBody3D pauschal beim NavigationMesh nicht beachtet werden und man keine Einstellung machen kann um das zu ändern. Einen StaticBody dem Character hinzuzufügen klappt auch nicht, weil er sich auch nicht die Child-Nodes eines CharacterBody3D anschaut. Stattdessen müsste ich die Hierarchy der Nodes ändern um das Mesh zu erzeugen, was mit seinen eigenen Problemen kommt.

#### Alternative Navigation

Es gäbe ein paar Möglichkeiten das Problem mit der Navigation zu lösen, entweder schreibe ich mein eigenes Navigationssystem und verwerfe die Godot-Lösung vollständig, oder ich versuche es noch zu verwenden, aber Erzeuge mein eigenes NavigationMesh, das auch mit CharacterBody3D richtig umgeht.

Ich habe etwas Zeit damit verbracht das NavigationMesh selbst zu erzeugen, die Schwierigkeit dabei war hauptsächlich zu verstehen in welchem Format er das Mesh dafür erwartet. Ich habe auch keine Möglichkeit das türkise DebugMesh aus dem Bild weiter oben auch für selbst erzeugte NavigationMeshes anzeigen zu lassen. Der erste Versuch ein NavigationMesh zu erzeugen hatte nicht funktioniert und debuggen lässt sich das nicht wirklich, deshalb musste ich für meine Lösung, um da vorwärts zu kommen, auch noch mein eigenes DebugMesh erzeugen. Das hat bisher alles wertvolle Zeit gekostet. Ich habe den Algorithmus dafür nicht abgeschlossen, deswegen werde ich den hier nicht posten. Das DebugMesh sieht zwar gut aus, es kann aber gut, sein dass vielleicht die Orientierung des Meshes falsch ist, oder das ich mehr herausfiltern muss. Im Moment wird für jedes Quadrat des Gitters ein Quadrat im Mesh angelegt, anstatt das Mesh nur aus den Rändern des betretbaren Bereiches zu machen. Wenn ich an dem Spiel weiterprogrammiere, werde ich wahrscheinlich versuchen das noch fertig zu bekommen, für den Moment habe ich erst einmal die Kollision zwischen den Charakteren deaktiviert. Man kann durch die Berechnung des Bewegungsgitters einen anderen Charakter nicht als Ziel auswählen, wenn eine Route aber hindurch führt, bewegt sich der Charakter einfach durch den anderen hindurch.

Die andere Lösung wäre Charaktere einfach nur in dem Gitter bewegen zu lassen, dass ich bereits berechnet habe und sich dann nur von einer Zelle zur nächsten zu bewegen. Das würde leider nicht so toll aussehen, zumindest bei "diagonalen" Bewegungen.

### Kamera

Ich habe für das Spiel nach einem Kamerasystem gesucht, es gab ein paar die interessant aussahen, wie [Phantom Camera](https://github.com/ramokz/phantom-camera), beim Installieren sah ich aber, dass das ziemlich viel ist und etwas unnötig kompliziert. Ich habe dann noch nach etwas einfacherem gesucht. Viel brauche ich für das Spiel eigentlich nicht, aber ich habe keine Kamerasteuerung gefunden die mir gefallen hat. Deswegen habe ich eine selbst geschrieben, für mich funktioniert das sehr gut und ist sogar kürzer als alles was ich online gefunden habe.

```csharp
public override void _PhysicsProcess(double delta)
{
    float rotation = Input.GetAxis("camera_rotate_left", "camera_rotate_right"); // Die strings sind alles Input-Actions, die werden in den Projekteinstellungen Tasten zugewiesen.
    float zoom = Input.GetAxis("camera_zoom_in", "camera_zoom_out"); // GetAxis gibt eine Zahl zwischen -1 und 1 zurück, je nachdem welche der Inputs aktiv ist, oder beide.
    Vector2 inputDirection = Input.GetVector("camera_left", "camera_right", "camera_forward", "camera_backward"); // Wie GetAxis, aber für 2 gleichzeitig.
    Vector3 direction = (Transform.Basis * new Vector3(inputDirection.X, 0, inputDirection.Y)).Normalized();

    Velocity = direction * MovementSpeed;

    MoveAndSlide();
    Rotation += Vector3.Down * rotation * RotationSpeed * (float)delta;

    _camera!.LookAt(Position);
    float zoomDistance = Mathf.Clamp(_camera!.Position.Length() + zoom * ZoomSpeed * (float)delta, ZoomMinimum, ZoomMaximum);
    _camera!.Position = _camera.Transform.Basis * new Vector3(0, 0, zoomDistance);

    base._PhysicsProcess(delta);
}
```

![Camera-Node](/post_assets/GameJam/camera_node.webp)

Es handelt sich dabei um eine "Orbit"-Kamera, sie schaut immer auf ein bestimmtes Ziel. Die Kamera ist ein Child-Node eines CharacterBody3D, welches das Ziel ist auf das die Kamera ständig schaut. Die Transormation (Translation, Rotation, Scale) von Child-Nodes ist relativ zum Parent-Node, das heißt, eine Änderung der Position wirkt sich auch auf alle Child-Nodes aus. Wenn man das Ziel also bewegt, bewegt man gleichzeitig auch die Kamera mit, kann sich also so durch die Map bewegen. Die CollisionShape3D ist an der selben Position wie die Kamera, dadurch kann der CharacterBody3D mit Umgebung kollidieren. Das führt dazu, dass man die Kamera nicht durch Gebäude oder andere Hindernisse hindurch bewegen kann. Die Rotation des Ziels macht es auch einfach die Kamera zu rotieren. Wenn das Ziel sich rotiert, rotiert sich die Kamera automatisch um das Ziel herum.

Finale Kamera-Position = Ziel-Position + Ziel-Rotation + Kamera-Position

Man kann sich das so denken, dass jede der Operationen den Koordinatenursprung anpasst, wenn wir eine Translation machen ist die neue Mitte der Welt am Ort Ziel-Translation, mit der Rotation dreht sich die ganze Welt und wenn wir dann eine Kamera-Translation machen, machen wir die lokal entlang der X-Achse, aber dadurch dass sich die Rotation die ganze Welt um zum Beispiel 45° gedreht hat, verläuft die X-Achse nun in einem 45° Winkel. Das führt dazu, dass wenn wir die Ziel-Rotation anpassen, die Kamera sich um die Ziel-Position herum bewegt.

## Der letzte Stand

Was wir noch geschafft hatten, aber hier noch nicht genauer beschrieben wurde:
- einfaches Startmenu mit Optionen für Lautstärke
- Musik für Menu und Kampf
- Einheiten hatten Lebenspunkte, Aktionspunkte und Initiative-Werte die die Reihenfolge der Figuren bestimmen
- Einheiten waren abwechselnd dran und haben ihren Zug automatisch beendet wenn die Aktionspunkte verbraucht waren
- ein Colt als Fernkampfwaffe, man konnte nur gegnerische Einheiten auswählen, diese wurden dann angeschossen
- Einheiten konnten Rüstungen tragen, die den erhaltenen Schaden reduzieren
- man konnte Aktionen wie das Zielen auf einen Gegner abbrechen
- wenn Einheiten Schaden erleiden, habe sie eine Animation abgespielt und eine Zahl ist darüber erschienen, die die Menge an erlitten Schaden darstellt und mit einer Animation wieder verschwindet
- Wenn auf Gegner gezielt werden kann, wird ein 2D Rahmen um die Einheit platziert, dessen Position und Größe sich der BoundingBox der Einheit anpasst
- ausgerüstete Waffen befinden sich in den Händen der Charaktere und bewegen sich mit
- Einheiten drehen sich zu der Einheit auf die man zielt
- Einheiten können sterben und die Kollision für diese Einheit wird dann entfernt
- es gibt ein Schwert als Nahkampfwaffe, wobei das Zielsystem dafür nicht fertig geworden ist
- es gibt eine "Schattenfähigkeit" die man für Einheiten aktivieren kann, dadurch kann sich die Einheit durch Hindernisse durch bewegen und es wird ein Partikelsystem auf der Einheit erzeugt um zu zeigen, dass die Fähigkeit aktiv ist

Die letzte Aufgabe an der ich noch dran war, war es eine KI für Gegner zu implementieren, dazu wollte ich LimboAI verwenden, hatte aber noch nichts brauchbares geschafft.

Das ist eigentlich eine gute Basis die man vielleicht beim nächsten GameJam wiederverwenden könnte, in der Hoffnung das man bei einem neuen Thema nicht all zu viel anpassen müsste. Die aktuellen Mechaniken müssten dann abgeschlossen werden, wir würden die Assets hübsch machen und vielleicht hätten wir auch noch Zeit für ein Progression-System, welches ursprünglich angedacht war. Die Progression wäre, das man durch mehrere Maps spielen muss um dann einen Siegbildschirm zu bekommen und die Einheiten könnten zwischen den Missionen noch neue Fähigkeiten freischalten.
